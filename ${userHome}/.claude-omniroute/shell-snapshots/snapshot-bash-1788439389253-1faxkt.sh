# Snapshot file
# Unset all aliases to avoid conflicts with functions
unalias -a 2>/dev/null || true
shopt -s expand_aliases
# Check for rg availability
if ! (unalias rg 2>/dev/null; command -v rg) >/dev/null 2>&1; then
  function rg {
  local _cc_bin="${CLAUDE_CODE_EXECPATH:-}"
  [[ -x $_cc_bin ]] || _cc_bin=/c/Users/NAVEEN/.local/bin/claude.exe
  if [[ ! -x $_cc_bin ]]; then command rg ${1+"$@"}; return; fi
  if [[ -n ${ZSH_VERSION:-} ]]; then
    ARGV0=rg "$_cc_bin" ${1+"$@"}
  elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    ARGV0=rg "$_cc_bin" ${1+"$@"}
  else
    (exec -a rg "$_cc_bin" ${1+"$@"})
  fi
}
fi
# Shadow pkill to refuse patterns matching the CLI process
unalias pkill 2>/dev/null || true
function pkill {
  if [ -n "${CLAUDE_PID:-}" ] && [ -r "/proc/${CLAUDE_PID}/comm" ]; then
    local _cc_skip="" _cc_a
    local -a _cc_probe=()
    for _cc_a in ${1+"$@"}; do
      if [ -n "$_cc_skip" ]; then _cc_skip=""; continue; fi
      case "$_cc_a" in
        --signal) _cc_skip=1 ;;
        --signal=*|-e|--echo) ;;
        -[0-9]*) ;;
        -[PUGOF]?*) _cc_probe+=("$_cc_a") ;;
        -[ABCDEFGHIJKLMNOPQRSTUVWXYZ][ABCDEFGHIJKLMNOPQRSTUVWXYZ0-9]*) ;;
        *) _cc_probe+=("$_cc_a") ;;
      esac
    done
    if command pgrep ${_cc_probe[@]+"${_cc_probe[@]}"} 2>/dev/null | command grep -qx "${CLAUDE_PID}"; then
      printf 'pkill: refusing to run — this pattern matches the Claude CLI process (PID %s). Narrow the pattern, or target your own children with `pkill -P $$ ...`.\n' "${CLAUDE_PID}" >&2
      return 1
    fi
  fi
  command pkill ${1+"$@"}
}
export PATH='/c/Users/NAVEEN/bin:/mingw64/bin:/usr/local/bin:/usr/bin:/bin:/mingw64/bin:/usr/bin:/c/Users/NAVEEN/bin:/c/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.9/bin:/c/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.9/libnvvp:/c/Program Files/Common Files/Oracle/Java/javapath:/c/Program Files (x86)/Common Files/Oracle/Java/java8path:/c/Program Files (x86)/Common Files/Oracle/Java/javapath:/c/windows/system32:/c/windows:/c/windows/System32/Wbem:/c/windows/System32/WindowsPowerShell/v1.0:/c/windows/System32/OpenSSH:/c/Program Files (x86)/NVIDIA Corporation/PhysX/Common:/c/Program Files/NVIDIA Corporation/NVIDIA NvDLISR:/c/Program Files/Microsoft SQL Server/150/Tools/Binn:/c/Program Files/Microsoft SQL Server/Client SDK/ODBC/170/Tools/Binn:/c/Program Files/Azure Data Studio/bin:/c/Program Files/Go/bin:/c/Program Files (x86)/terraform:/c/Program Files/Tesseract-OCR:/c/WINDOWS/system32:/c/WINDOWS:/c/WINDOWS/System32/Wbem:/c/WINDOWS/System32/WindowsPowerShell/v1.0:/c/WINDOWS/System32/OpenSSH:/c/Users/NAVEEN/FlutterDev/flutter/bin:/cmd:/c/Program Files (x86)/Microsoft SQL Server/160/Tools/Binn:/c/Program Files/Microsoft SQL Server/160/Tools/Binn:/c/Program Files/Microsoft SQL Server/160/DTS/Binn:/c/Program Files (x86)/Microsoft SQL Server/150/Tools/Binn:/c/Program Files/Microsoft SQL Server/150/DTS/Binn:/c/ProgramData/chocolatey/bin:/c/Program Files/Java/jdk-17/bin:/c/Program Files/NVIDIA Corporation/Nsight Compute 2025.2.1:/c/Program Files/NVIDIA Corporation/NVIDIA App/NvDLISR:/c/Users/NAVEEN/AppData/Roaming/npm:/c/Program Files/Microsoft SQL Server/170/Tools/Binn:/c/Program Files/dotnet:/c/Program Files/GitHub CLI:/c/Program Files/nodejs:/c/Program Files/Rancher Desktop/resources/resources/win32/bin:/c/Program Files/Rancher Desktop/resources/resources/win32/docker-cli-plugins:/c/Program Files/Rancher Desktop/resources/resources/linux/bin:/c/Program Files/Rancher Desktop/resources/resources/linux/docker-cli-plugins:/c/Program Files/PowerShell/7:/c/Users/NAVEEN/.local/bin:/c/Users/NAVEEN/.local/bin:/c/Users/NAVEEN/AppData/Local/Programs/Python/Python312/Scripts:/c/Users/NAVEEN/AppData/Local/Programs/Python/Python312:/c/Program Files/Common Files/Oracle/Java/javapath:/c/Program Files (x86)/Common Files/Oracle/Java/java8path:/c/Program Files (x86)/Common Files/Oracle/Java/javapath:/c/windows/system32:/c/windows:/c/windows/System32/Wbem:/c/windows/System32/WindowsPowerShell/v1.0:/c/windows/System32/OpenSSH:/c/Program Files (x86)/NVIDIA Corporation/PhysX/Common:/c/Program Files/NVIDIA Corporation/NVIDIA NvDLISR:/c/Program Files/Microsoft SQL Server/150/Tools/Binn:/c/Program Files/Microsoft SQL Server/Client SDK/ODBC/170/Tools/Binn:/c/Program Files (x86)/Microsoft SQL Server/160/DTS/Binn:/c/Program Files/Azure Data Studio/bin:/c/Program Files/Go/bin:/c/Program Files (x86)/terraform:/c/Program Files/nodejs:/c/Program Files/dotnet:/c/Program Files/Tesseract-OCR:/c/WINDOWS/system32:/c/WINDOWS:/c/WINDOWS/System32/Wbem:/c/WINDOWS/System32/WindowsPowerShell/v1.0:/c/WINDOWS/System32/OpenSSH:/c/Users/NAVEEN/FlutterDev/flutter/bin:/cmd:/c/Program Files (x86)/Microsoft SQL Server/160/Tools/Binn:/c/Program:/c/Users/NAVEEN/AppData/Local/Programs/Microsoft VS Code/bin:/c/Users/NAVEEN/AppData/Local/Programs/Ollama:/c/Users/NAVEEN/AppData/Local/Pub/Cache/bin:/c/Users/NAVEEN/.dotnet/tools:/c/Users/NAVEEN/AppData/Local/GitHubDesktop/bin:/c/Users/NAVEEN/AppData/Roaming/npm:/c/Users/NAVEEN/bin:/usr/bin/vendor_perl:/usr/bin/core_perl'
