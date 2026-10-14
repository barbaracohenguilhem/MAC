#!/bin/zsh
# emerald_cycle.sh N — run N GemEX emerald cycles: (reopen) CUT all emerald rough on Bold -> wait -> CLAIM -> DONE -> BUY 100.
# WARNING: blind taps. On 2026-09-29 cycle 2 drifted into the GemEX inventory list (a stale screen). Run 1 cycle at a time and check /tmp/ec_<i>_*.png between cycles. It occupies the phone ~3.5 min per cycle.
# Assumes GemEX is open. Saves /tmp/ec_<i>_reveal.png (batch P&L) and /tmp/ec_<i>_cut.png per cycle.
S=~/.claude/skills/dd-common/scripts
N=${1:-1}
reopen() { DD_WAIT=1.5 $S/dd.sh tap 96 271 >/dev/null; DD_WAIT=2.5 $S/dd.sh tap 198 1741 >/dev/null; }
for i in $(seq 1 $N); do
  echo "cycle $i start $(date +%T)"
  reopen
  DD_WAIT=1.5 $S/dd.sh tap 454 436 >/dev/null      # CUT tab
  DD_WAIT=1.2 $S/dd.sh tap 454 640 >/dev/null      # EMERALD
  DD_WAIT=1.2 $S/dd.sh tap 454 875 >/dev/null      # ALL
  DD_WAIT=1.2 $S/dd.sh tap 694 1022 >/dev/null     # BOLD
  DD_WAIT=3 $S/dd.sh tap 454 1231 >/dev/null       # START
  cp /tmp/dd.png /tmp/ec_${i}_cut.png
  sleep 120
  DD_WAIT=13 $S/dd.sh tap 454 968 >/dev/null       # CLAIM
  DD_WAIT=10 $S/dd.sh tap 454 300 >/dev/null      # tap to continue past a best-of-batch card (harmless otherwise)
  cp /tmp/dd.png /tmp/ec_${i}_reveal.png
  DD_WAIT=2.5 $S/dd.sh tap 450 1771 >/dev/null     # DONE
  DD_WAIT=1.5 $S/dd.sh tap 196 436 >/dev/null      # BUY tab
  DD_WAIT=2 $S/dd.sh tap 450 1217 >/dev/null       # EMERALD row
  DD_WAIT=1.2 $S/dd.sh tap 357 1467 >/dev/null     # 100
  DD_WAIT=3 $S/dd.sh tap 454 1833 >/dev/null       # BUY
  cp /tmp/dd.png /tmp/ec_${i}_bought.png
  echo "cycle $i done $(date +%T)"
done
