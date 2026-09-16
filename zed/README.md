# Zed Editor — PigRabb Light / PigRabb Dark

ไฟล์ `pigrabb.json` เป็น theme family เดียวที่มี 2 theme อยู่ข้างใน คือ **PigRabb Light** และ **PigRabb Dark**

- สีของ UI และ syntax มาจาก Coding kit ของ DS
- terminal panel ใช้ชุด ANSI เดียวกับ Warp ของโหมดนั้น และใช้พื้นเดียวกับ editor
- ใส่ key ครบทุกตัวที่ theme One ทางการของ Zed ใช้ Zed จึงไม่ต้องหยิบสีจาก theme อื่นมาเติม

> ไฟล์นี้ถูกสร้างโดย `scripts/build.mjs` ถ้าจะเปลี่ยนสี ให้แก้ใน `tokens/` แล้ว build ใหม่ ห้ามแก้ไฟล์ json ตรงๆ

## ติดตั้ง

1. copy ไฟล์ theme ไปไว้ที่ `~/.config/zed/themes/`

   ```sh
   ./zed/install.sh         # หรือ ./install.sh ที่ root เพื่อติดตั้งทุกโปรแกรม
   ```

   Zed เฝ้าดูโฟลเดอร์นี้อยู่ theme จะโหลดขึ้นมาเองโดยไม่ต้องเปิด Zed ใหม่

2. เปิด settings (`cmd-,`) แล้วแทนค่า `"theme"` เดิมด้วยข้อความนี้ (ถ้ายังไม่มีให้เพิ่มเข้าไป)

   ```jsonc
   "theme": {
     "mode": "system",
     "light": "PigRabb Light",
     "dark": "PigRabb Dark"
   },
   ```

   `"mode": "system"` ทำให้ Zed สลับ Light/Dark ตามโหมดของ macOS ถ้าอยากล็อกไว้โหมดเดียว ให้ใช้ `"light"` หรือ `"dark"` แทน

   หรือจะเลือกผ่าน theme selector (`cmd-k cmd-t`) ก็ได้

## ถอนการติดตั้ง

1. เปลี่ยน `"theme"` ใน settings กลับเป็น theme เดิม เช่น `"One Dark"`
2. ลบไฟล์ theme

   ```sh
   ./zed/install.sh --uninstall
   ```

## แก้ปัญหา

- **ไม่เห็น PigRabb ใน theme selector**:
  - เช็คว่าไฟล์อยู่ที่ `~/.config/zed/themes/pigrabb.json` ตรงๆ Zed อ่านเฉพาะไฟล์ชั้นบนสุดของโฟลเดอร์ ไม่อ่านใน subfolder
  - เปิด command palette แล้วรัน `zed: open log` เพื่อหา error ที่เกี่ยวกับ theme
- **ใช้บน Linux**: โฟลเดอร์ themes อยู่ที่ `~/.config/zed/themes/` เหมือน macOS ใช้ `install.sh` ตัวเดียวกันได้

## ข้อจำกัดที่รู้อยู่แล้ว

- **status bar ไม่กลับสีแบบ Coding kit**: Zed ไม่มี key สำหรับสีตัวอักษรของ status bar จึงใช้พื้นเดียวกับ title bar แทน
- **tab ที่ active ไม่มีเส้นชมพูด้านล่าง**: Zed ไม่มี key นี้ tab ที่ active แยกจากตัวอื่นด้วยสีพื้นอย่างเดียว
- **Dark: keyword (magenta) กับ attribute/property (pink) สีใกล้กันมาก**: เพราะใน DS โหมดมืด `magenta-500` กับ `pink-700` มีค่าแทบเท่ากันอยู่แล้ว
