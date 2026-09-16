# macOS Terminal — PigRabb Light / PigRabb Dark

| ไฟล์ | ชื่อ profile | ที่มาของสี |
|---|---|---|
| `PigRabb Dark.terminal` | PigRabb Dark | palette กลางคืนของ Terminal kit ใน DS (ชุดเดียวกับ Warp Dark) |
| `PigRabb Light.terminal` | PigRabb Light | token โหมดสว่างของ DS (ชุดเดียวกับ Warp Light) |

ชื่อไฟล์ต้องเหมือนชื่อ profile ทุกตัวอักษร เพราะ macOS Terminal ตั้งชื่อ profile ตามชื่อไฟล์ตอน import

- ANSI 16 สีเป็นชุดเดียวกับ Warp ของแต่ละโหมด
- selection ของ Dark ใช้สี `sel` ของ Terminal kit ส่วน Light ใช้ `pink-100`
- ตัวหนาใช้สีเดียวกับตัวอักษรปกติ
- font เหมือน profile `Basic` คือ SF Mono Terminal 11pt แปลว่าต่างจากค่าเริ่มต้นแค่เรื่องสี

> ไฟล์ทั้งสองถูกสร้างโดย `scripts/build.mjs` ถ้าจะเปลี่ยนสี ให้แก้ใน `tokens/` แล้ว build ใหม่ ห้ามแก้ไฟล์ `.terminal` ตรงๆ

## ต่างจาก Warp และ Zed ยังไง

- **ไม่มีโฟลเดอร์ theme**: macOS Terminal เก็บ profile ไว้ในไฟล์ preferences ของตัวเองเท่านั้น การติดตั้งจึงใช้วิธี **import** ไม่ใช่ copy
- **สลับ Light/Dark ตาม macOS เองไม่ได้**: ต้องเลือก profile เอง หรือใช้เครื่องมือเสริม (ดูหัวข้อ "สลับตามโหมดของ macOS")

## ติดตั้ง

1. import profile

   ```sh
   ./macos-terminal/install.sh     # หรือ ./install.sh ที่ root เพื่อติดตั้งทุกโปรแกรม
   ```

   script จะ `open` ไฟล์ `.terminal` ที่ยังไม่มีในเครื่อง ผลเหมือนกด double-click คือ macOS Terminal จะ import profile แล้ว **เปิดหน้าต่างใหม่ 1 หน้าต่างต่อ profile** ถ้ามี profile ชื่อเดียวกันอยู่แล้ว script จะข้ามไป ไม่ import ซ้ำ

   ถ้าไม่ใช้ script ก็ import เองได้ที่ Terminal → Settings → Profiles → ปุ่ม ⋯ → Import… แล้วเลือกไฟล์

2. ตั้งเป็น profile ค่าเริ่มต้น เลือกได้ 2 แบบ

   **ล็อกไว้โหมดเดียว** (ตัวอย่างนี้ใช้ Dark ถ้าอยากได้ Light ให้เปลี่ยนเป็น `PigRabb Light`)

   ```sh
   osascript \
     -e 'tell application "Terminal" to set default settings to settings set "PigRabb Dark"' \
     -e 'tell application "Terminal" to set startup settings to settings set "PigRabb Dark"'
   ```

   หรือตั้งผ่าน UI: Settings → Profiles → เลือก profile → กดปุ่ม **Default** แล้วไปที่ Settings → General → On startup, open → New window with profile → เลือก profile

   **สลับตามโหมดของ macOS**: ดูหัวข้อถัดไป

3. หน้าต่างที่เปิดอยู่ก่อนแล้วจะยังใช้ profile เดิม ถ้าจะเปลี่ยนทุกหน้าต่างทันที ให้รัน

   ```sh
   osascript -e 'tell application "Terminal" to set current settings of every tab of every window to settings set "PigRabb Dark"'
   ```

## สลับตามโหมดของ macOS

macOS Terminal ไม่มีตัวเลือกนี้ในตัว ถ้าอยากให้สลับอัตโนมัติ ใช้เครื่องมือของบุคคลที่สามได้ เช่น [auto-terminal-profile](https://github.com/patrik-csak/auto-terminal-profile) ซึ่งเปลี่ยน profile ตามโหมดของ macOS ให้ ตอนตั้งค่าให้ใช้ชื่อ profile `PigRabb Light` กับ `PigRabb Dark` (repo นี้ไม่ได้ติดตั้งหรือดูแลเครื่องมือนี้ให้)

## อัปเดตหลัง build ใหม่

macOS Terminal ไม่ทับ profile ที่มีอยู่แล้ว ต้องลบของเดิมก่อน

1. Terminal → Settings → Profiles → เลือก `PigRabb Dark` แล้วกด − ทำแบบเดียวกันกับ `PigRabb Light`
2. รัน `./macos-terminal/install.sh` ใหม่
3. ตั้ง profile ค่าเริ่มต้นอีกครั้งตามขั้นตอนที่ 2 ของหัวข้อติดตั้ง

## ถอนการติดตั้ง

1. ตั้ง profile ค่าเริ่มต้นกลับเป็น `Basic`

   ```sh
   osascript \
     -e 'tell application "Terminal" to set default settings to settings set "Basic"' \
     -e 'tell application "Terminal" to set startup settings to settings set "Basic"'
   ```

2. Terminal → Settings → Profiles → เลือก `PigRabb Dark` / `PigRabb Light` → กด −

รัน `./macos-terminal/install.sh --uninstall` ได้ แต่ script จะแค่พิมพ์ขั้นตอนนี้ออกมา ไม่ได้ลบ profile ให้

## แก้ปัญหา

- **มี `PigRabb Dark 1`, `PigRabb Dark 2` โผล่มา**: เกิดจากเปิดไฟล์ `.terminal` ซ้ำเอง (script จะข้ามถ้ามี profile อยู่แล้ว) ให้ลบตัวที่มีเลขต่อท้ายใน Settings → Profiles
- **สีดูต่างจาก Warp**: ถ้าเปิด System Settings → Accessibility → Display → Increase contrast อยู่ macOS จะปรับสีให้เอง
- **script ไม่ทำอะไรบน Linux หรือ OS อื่น**: macOS Terminal มีเฉพาะบน macOS

## สิ่งที่ profile ของ macOS Terminal ทำไม่ได้

- กำหนดสี dim ไม่ได้
- กำหนดสีของ title bar หรือ tab ไม่ได้ ส่วนนี้ macOS วาดเองตามโหมด Light/Dark ของระบบ
