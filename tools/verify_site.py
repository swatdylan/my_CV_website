#!/usr/bin/env python3
"""
Sanity-check script.js + index.html before every push to this site.

Run this after ANY edit to the equity curve, monthly table, or yield
stats, and fix every FAIL before committing. This exists because the
following real bugs shipped to production without it:

  1. Monthly table "p" value didn't match the $ total it was derived
     from (a transcription slip when updating Sep '26's row).
  2. Range tabs (1M/3M/6M/1Y) silently excluded the first week inside
     the window from the total, because the baseline index was chosen
     as "first point >= cutoff" instead of "last point < cutoff" --
     this made 1M disagree with the monthly table by a full week's P&L.
  3. YTD showed two different numbers in two different places (chart
     vs stat card) because one used open-date attribution and the
     other used realized/close-date attribution, with no check tying
     them together.

Usage:
    python3 tools/verify_site.py

Exits non-zero (and prints every failure) if anything is inconsistent.
Add new checks here whenever a new class of bug is found -- don't just
fix the instance, fix the thing that should have caught it.
"""
import re, sys, datetime, math, os

SITE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
failures = []


def check(label, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"  [{status}] {label}" + (f"  -- {detail}" if detail and not condition else ""))
    if not condition:
        failures.append(label)


def load_text(name):
    with open(os.path.join(SITE_DIR, name)) as f:
        return f.read()


def parse_equity_series(src):
    labels = [x.strip().strip('"') for x in
              re.search(r'EQUITY_LABELS = \[("Apr 21".*?)\];', src).group(1).split(',')]
    strat = [float(x) for x in re.search(r'EQUITY_STRAT = \[(.*?)\];', src).group(1).split(',')]
    spx = [float(x) for x in re.search(r'EQUITY_SPX = \[(.*?)\];', src).group(1).split(',')]
    return labels, strat, spx


def parse_dates(labels):
    months = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
              "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12}
    dates = []
    year, prev = 2025, None
    for lab in labels:
        mon, day = lab.split()
        m = months[mon]
        if prev is not None and m < prev:
            year += 1
        dates.append(datetime.date(year, m, int(day)))
        prev = m
    return dates


def parse_perf_table(src):
    m = re.search(r'const perfData = \[(.*?)\];', src, re.S)
    rows = re.findall(r'\{ m: "([^"]+)", p: "([^"]+)%", c: "([^"]+)%" \}', m.group(1))
    return [(mth, float(p), float(c)) for mth, p, c in rows]


def range_start_index_fixed(dates, last_date, days):
    """Mirrors the CORRECT JS logic: last point strictly BEFORE the cutoff."""
    cutoff = last_date - datetime.timedelta(days=days)
    idx = 0
    for i, d in enumerate(dates):
        if d < cutoff:
            idx = i
        else:
            break
    return idx


def main():
    print("=" * 70)
    print("1. EQUITY CURVE ARRAYS")
    print("=" * 70)
    script = load_text("script.js")
    labels, strat, spx = parse_equity_series(script)
    check("labels/strat/spx arrays are the same length",
          len(labels) == len(strat) == len(spx),
          f"{len(labels)} / {len(strat)} / {len(spx)}")
    dates = parse_dates(labels)
    check("dates are strictly increasing (no parse/rollover mistake)",
          all(dates[i] < dates[i + 1] for i in range(len(dates) - 1)))

    print()
    print("=" * 70)
    print("2. MONTHLY TABLE ARITHMETIC")
    print("=" * 70)
    rows = parse_perf_table(script)
    running = 0.0
    all_ok = True
    for mth, p, c in rows:
        expected = round(running + p, 2)
        ok = abs(expected - c) < 0.011
        if not ok:
            all_ok = False
            print(f"    {mth}: p={p} c={c} expected_c={expected}")
        running = c
    check(f"all {len(rows)} monthly rows: c[i] == c[i-1] + p[i]", all_ok)
    check("monthly table's final cumulative == equity curve's last point",
          abs(rows[-1][2] - strat[-1]) < 0.011,
          f"table={rows[-1][2]} curve={strat[-1]}")

    print()
    print("=" * 70)
    print("3. RANGE TAB BASELINES (1M/3M/6M/1Y) MATCH REALITY")
    print("=" * 70)
    last_date = dates[-1]
    # Spot-check 1M specifically against the current month's table row, since
    # a 30-day lookback from a month-end-ish date should land close to it.
    # This is the exact check that would have caught bug #2 above.
    idx_1m = range_start_index_fixed(dates, last_date, 30)
    headline_1m = round(strat[-1] - strat[idx_1m], 2)
    current_month_row = rows[-1]
    # Only a meaningful check if the lookback baseline lands before this month
    # started (i.e. 1M is capturing "this month's" activity, which is the
    # common case right after a weekly update).
    month_start_val = rows[-2][2] if len(rows) > 1 else 0.0
    if abs(strat[idx_1m] - month_start_val) < 0.011:
        check("1M headline matches the latest monthly-table row (common case)",
              abs(headline_1m - current_month_row[1]) < 0.011,
              f"1M={headline_1m} table_row={current_month_row[1]}")
    else:
        print("  [SKIP] 1M vs monthly row -- 30-day baseline doesn't land on last month's "
              "boundary this time (not a bug, just not comparable this run)")
    check("range baseline is never INSIDE the window (the off-by-one bug)",
          all(dates[range_start_index_fixed(dates, last_date, d)] < last_date - datetime.timedelta(days=d)
              for d in (30, 91, 182, 365)))
    # The check above only re-derives from the DATA with known-correct Python logic --
    # it says nothing about what the actual JS implementation does. Inspect the source
    # text directly for the exact regression that shipped once already.
    range_fn_match = re.search(r'function rangeStartIndex.*?\n            \}', script, re.S)
    range_fn_src = range_fn_match.group(0) if range_fn_match else ""
    check("rangeStartIndex() source does not contain the old buggy pattern",
          'findIndex(d => d >= cutoff)' not in range_fn_src,
          "found the exact regression pattern from commit aef6e2f and earlier")
    check("rangeStartIndex() source uses the fixed 'last point BEFORE cutoff' pattern",
          bool(re.search(r'EQUITY_DATES\[i\]\s*<\s*cutoff', range_fn_src)))

    # The "1-Year Return" stat card uses the SAME open-date convention as the chart's
    # 1Y tab (no realized-basis override like YTD has) -- so it must always equal
    # rangeStartIndex(365)'s result exactly. This is exactly the check that would have
    # caught the stat card going stale after the off-by-one fix changed the chart's
    # 1Y number but nobody recomputed the card to match.
    idx_1y = range_start_index_fixed(dates, last_date, 365)
    expected_1y = round(strat[-1] - strat[idx_1y], 2)
    index_html_for_1y = load_text("index.html")
    oneyear_card_match = re.search(
        r'mini-stat-value[^>]*>(\+[\d.]+)%</span>\s*<span class="mini-stat-label">1-Year', index_html_for_1y)
    if oneyear_card_match:
        card_val = float(oneyear_card_match.group(1))
        check("1-Year stat card matches rangeStartIndex(365) exactly",
              abs(card_val - expected_1y) < 0.011,
              f"card={card_val} expected={expected_1y} (baseline {dates[idx_1y]}={strat[idx_1y]})")
    else:
        check("found 1-Year stat card to compare", False,
              "regex didn't match -- update this check if the markup changed")

    print()
    print("=" * 70)
    print("4. YTD CONSISTENCY (stat card vs chart)")
    print("=" * 70)
    index_html = load_text("index.html")
    ytd_card_match = re.search(
        r'mini-stat-value[^>]*>(\+[\d.]+)%</span>\s*<span class="mini-stat-label">YTD', index_html)
    ytd_js_match = re.search(r'REALIZED_YTD = ([\d.]+);', script)
    if ytd_card_match and ytd_js_match:
        card_val = float(ytd_card_match.group(1))
        js_val = float(ytd_js_match.group(1))
        check("stat card YTD matches the chart's hardcoded REALIZED_YTD offset target",
              abs(card_val - js_val) < 0.011, f"card={card_val} js={js_val}")
    else:
        check("found both YTD stat card and REALIZED_YTD constant to compare", False,
              "regex didn't match -- update this check if the markup changed")

    print()
    print("=" * 70)
    if failures:
        print(f"RESULT: {len(failures)} FAILURE(S) -- fix before pushing:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    else:
        print("RESULT: all checks passed.")
        sys.exit(0)


if __name__ == "__main__":
    main()
