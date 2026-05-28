# ~/.zshrc 끝에 alias 블록 추가
cat >> ~/.zshrc <<'EOF'

# Antigravity CLI (agy) aliases
alias ag='agy'
alias agd='agy --dangerously-skip-permissions'
alias agr='agy --continue --dangerously-skip-permissions'
EOF

# 현재 셸에 즉시 반영
source ~/.zshrc

# 잘 등록됐는지 확인
type ag agd agr
