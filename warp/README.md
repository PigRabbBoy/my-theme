# Warp Terminal — PigRabb Light / PigRabb Dark

| ไฟล์ | ชื่อ theme | ที่มาของสี |
|---|---|---|
| `pigrabb_dark.yaml` | PigRabb Dark | palette กลางคืนของ Terminal kit ใน DS |
| `pigrabb_light.yaml` | PigRabb Light | token โหมดสว่างของ DS |

> ไฟล์ทั้งสองถูกสร้างโดย `scripts/build.mjs` ถ้าจะเปลี่ยนสี ให้แก้ใน `tokens/` แล้ว build ใหม่ ห้ามแก้ไฟล์ yaml ตรงๆ

## ติดตั้ง (macOS)

1. copy ไฟล์ theme ไปไว้ที่ `~/.warp/themes/`

   ```sh
   ./warp/install.sh        # หรือ ./install.sh ที่ root เพื่อติดตั้งทุกโปรแกรม
   ```

2. **ปิด Warp แล้วเปิดใหม่** ถ้าโฟลเดอร์ `~/.warp/themes` เพิ่งถูกสร้าง Warp อาจยังมองไม่เห็นจนกว่าจะเปิดใหม่

3. เปิด `~/.warp/settings.toml` ไปที่ส่วน `[appearance.themes]` แล้วแทน 3 key `theme`, `system_theme` และ `selected_system_themes` ด้วยข้อความนี้ (key อื่นในส่วนนี้ปล่อยไว้ตามเดิม)

   ```toml
   [appearance.themes]
   theme = { custom = { name = "PigRabb Dark", path = "pigrabb_dark.yaml" } }
   system_theme = true
   selected_system_themes = { light = { custom = { name = "PigRabb Light", path = "pigrabb_light.yaml" } }, dark = { custom = { name = "PigRabb Dark", path = "pigrabb_dark.yaml" } } }
   ```

4. กดบันทึก Warp จะโหลด settings ใหม่ให้เอง จากนั้นจะสลับ Light/Dark ตามโหมดของ macOS

## ถอนการติดตั้ง

1. ใน `settings.toml` เปลี่ยนกลับเป็น theme เดิม เช่น

   ```toml
   theme = "dark"
   system_theme = false
   ```

2. ลบไฟล์ theme

   ```sh
   ./warp/install.sh --uninstall
   ```

## แก้ปัญหา

1. **ไม่เห็น PigRabb หรือยังเป็น theme เดิม**: ปิด Warp แล้วเปิดใหม่ก่อน (ติดตั้งครั้งแรกเจอบ่อยที่สุด) แล้วเช็คว่ามีไฟล์ `~/.warp/themes/pigrabb_dark.yaml` อยู่จริง
2. **กลายเป็น Dark ธรรมดาโดยไม่มี error**: แปลว่า `name` หรือ `path` ใน settings ไม่ตรงกับไฟล์ Warp จะกลับไปใช้ Dark โดยไม่เตือนอะไร
   - `name` ต้องเป็น `PigRabb Dark` / `PigRabb Light` ตรงตัวอักษร
   - `path` นับจากโฟลเดอร์ `~/.warp/themes/` **ห้ามขึ้นต้นด้วย `~`**
   - ถ้ายังไม่ได้ ลองใช้ path เต็ม เช่น `/Users/<ชื่อผู้ใช้>/.warp/themes/pigrabb_dark.yaml`
3. **ใช้ Settings Sync (cloud) ของ Warp**: settings ที่อ้างถึง theme จะ sync ไปเครื่องอื่นด้วย เครื่องไหนยังไม่ได้รัน `install.sh` จะแสดงเป็น Dark ไปก่อน ติดตั้งแล้วจะกลับมาปกติ
4. **สีของ prompt ไม่ตรงกับ Terminal kit**: prompt ในตัวของ Warp ใช้สีจากช่อง ANSI ที่ Warp กำหนดตายตัว (path = magenta/ชมพู, git = green, branch = yellow, เวลา = cyan) theme แก้ไม่ได้ ใน Terminal kit branch เป็น plum และ `❯` เป็น rose
5. **OS อื่นนอกจาก macOS**: `install.sh` รองรับเฉพาะ macOS ให้ดูตำแหน่งโฟลเดอร์ themes ที่ <https://docs.warp.dev/terminal/appearance/custom-themes> แล้ว copy ไฟล์เอง

## สิ่งที่ theme ของ Warp ทำไม่ได้

- ใส่สีโปร่งใส (alpha) ไม่ได้
- กำหนดสี dim ไม่ได้
- กำหนด font ไม่ได้
- กำหนดสีแยกทีละส่วนของ UI ไม่ได้ Warp คำนวณสีของ block และ tab จาก background, foreground และ accent เอง
