# 🔥 FIREWALL FIX - If Port 3000 is Blocked

## Quick Fix Steps

### Option 1: Allow Node.js in Firewall (Recommended)

1. **Open Windows Defender Firewall**
   - Press `Win + R`
   - Type: `wf.msc`
   - Press Enter

2. **Create Inbound Rule**
   - Click "Inbound Rules" (left side)
   - Click "New Rule..." (right side)
   - Select "Program"
   - Click Next
   - Select "This program path:"
   - Browse to: `C:\Program Files\nodejs\node.exe`
   - (Or find where Node.js is installed: `where.exe node`)
   - Click Next
   - Select "Allow the connection"
   - Click Next
   - Check all profiles (Domain, Private, Public)
   - Click Next
   - Name: "Node.js - Allow All"
   - Click Finish

3. **Create Outbound Rule** (same steps, but select "Outbound Rules")

### Option 2: Allow Port 3000 Directly

1. Open Windows Defender Firewall
2. Advanced Settings
3. Inbound Rules → New Rule
4. **Port** (not Program)
5. TCP
6. Specific local ports: `3000`
7. Allow connection
8. All profiles
9. Name: "Backend Port 3000"
10. Finish

### Option 3: Temporarily Disable Firewall (Testing Only)

```powershell
# Run as Administrator
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

**⚠️ Re-enable after testing!**

```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

## Verify Fix

After applying firewall rules, test again:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 3000
```

Should show: `TcpTestSucceeded : True`
