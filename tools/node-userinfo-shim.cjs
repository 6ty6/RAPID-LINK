// Work around Node 24/Windows environments where os.userInfo() fails with
// uv_os_get_passwd ENOMEM. Sanity CLI only needs stable user-directory data.
const os = require('node:os')

const fallbackHome = process.env.USERPROFILE || (
  process.env.HOMEDRIVE && process.env.HOMEPATH
    ? `${process.env.HOMEDRIVE}${process.env.HOMEPATH}`
    : process.cwd()
)

try {
  os.userInfo()
} catch {
  os.userInfo = () => ({
    uid: -1,
    gid: -1,
    username: process.env.USERNAME || 'rapidlink-user',
    homedir: fallbackHome,
    shell: null,
  })
}
