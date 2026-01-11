# Connectivity Troubleshooting

If you are having trouble connecting your iPhone to the Expo development server, follow these steps.

## Method 1: Local Network (Default)
This is the fastest method but depends on your network configuration.

### Requirements:
1.  **Same Wi-Fi**: Both your PC and your iPhone **must** be on the exact same Wi-Fi network.
2.  **No VPN**: Turn off VPNs on both your PC and your iPhone.
3.  **Firewall Permissions**: Windows Firewall must allow "Node.js JavaScript Runtime" to communicate on Private networks.

### Command:
```bash
npx expo start
```

---

## Method 2: Tunnel Mode (Fallback)
If Method 1 fails (usually due to router isolation, public Wi-Fi, or firewall issues), use Tunnel Mode.

### Why it works:
Tunnel mode creates a public URL (via `ngrok` or similar) that points to your local machine. Your phone connects to this public URL over the internet, bypassing any local network restrictions entirely.

### Requirements:
1.  **Internet Access**: Both devices need an internet connection.
2.  **Stability**: It might be slightly slower than local mode but it is much more reliable on restrictive networks.

### Command:
```bash
npx expo start --tunnel
```

---

## Technical Details
- **Port Conflicts**: If port `8081` is busy, Expo will ask to use another port (like `8082`). Always say **Yes** (`y`) to allow it.
- **IP Address**: If using Local Mode, ensure the IP shown in the terminal (e.g., `192.168.5.175`) matches your PC's IP.
