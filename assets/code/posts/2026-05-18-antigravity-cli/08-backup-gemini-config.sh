# 1) 내 환경에 뭐가 있는지 먼저 확인 (macOS / Linux)
ls -la ~/.gemini/

# 2) 날짜를 붙여 통째로 백업
cp -r ~/.gemini ~/.gemini-backup-$(date +%Y%m%d)
