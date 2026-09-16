# my-theme — PigRabb Themes

theme สีสำหรับโปรแกรมที่ใช้ทุกวัน สีทั้งหมดมาจาก **PigRabb Studio Design System** แต่ละโปรแกรมมีโฟลเดอร์ของตัวเอง และมีทั้ง Light กับ Dark ที่สลับตามโหมดของ macOS

| โปรแกรม | โฟลเดอร์ | ชื่อ theme | วิธีติดตั้ง |
|---|---|---|---|
| Warp Terminal | [`warp/`](warp/README.md) | PigRabb Light · PigRabb Dark | [warp/README.md](warp/README.md) |
| Zed Editor | [`zed/`](zed/README.md) | PigRabb Light · PigRabb Dark | [zed/README.md](zed/README.md) |

## ติดตั้งแบบเร็ว (macOS)

```sh
git clone https://github.com/PigRabbBoy/my-theme.git
cd my-theme
./install.sh
```

- `install.sh` แค่ **copy ไฟล์ theme** ไปไว้ในโฟลเดอร์ของแต่ละโปรแกรม ไม่แก้ไฟล์ settings ใดๆ
- จากนั้นต้องเลือก theme เองตามขั้นตอนใน [warp/README.md](warp/README.md) และ [zed/README.md](zed/README.md)
- ไม่ต้องติดตั้ง Node เพราะไฟล์ theme ถูก build ไว้ใน repo แล้ว
- ใช้วิธี copy ไม่ใช้ symlink ดังนั้นหลังติดตั้งจะย้ายหรือลบ repo ทิ้งก็ได้
- ถ้าจะถอนการติดตั้ง ให้รัน `./install.sh --uninstall` (แนะนำให้เปลี่ยน theme ใน settings กลับก่อน)

## Font ที่แนะนำ

ไฟล์ theme ของทั้งสองโปรแกรมกำหนด font ไม่ได้ DS ใช้ **JetBrains Mono** สำหรับโค้ด และ **Geist** สำหรับ UI

```sh
brew install --cask font-jetbrains-mono font-geist
```

- Zed: ใส่ `"buffer_font_family": "JetBrains Mono"` และ `"ui_font_family": "Geist"` ใน `settings.json`
- Warp: Settings → Appearance → Text → Terminal font → เลือก JetBrains Mono

## โครงสร้าง repo

```
tokens/colors_and_type.css   token ของ DS ที่ copy มาทั้งไฟล์ (ห้ามแก้เอง)
tokens/extras.json           สีที่ DS ไม่มี (ดูหัวข้อถัดไป)
scripts/build.mjs            แปลง OKLCH เป็น hex, สร้างไฟล์ theme, ตรวจ contrast
warp/                        theme ของ Warp + install.sh + README
zed/                         theme ของ Zed + install.sh + README
CONTEXT.md                   คำศัพท์ที่ใช้ในโปรเจกต์
```

## สีมาจากไหน

- **Token ของ DS**: role token ทั้งหมด (`--bg-surface`, `--text-primary`, …) เปลี่ยนตามโหมด light/dark ตาม `[data-theme="dark"]`
- **Warp Dark**: ใช้ palette กลางคืนของ Terminal kit ใน DS ตรงๆ (พื้น `#181117`)
- **Warp Light**: สร้างจาก token โหมดสว่าง **เป็นการตั้งใจไม่ทำตาม DS** เพราะ Terminal kit กำหนดให้ terminal มืดเสมอ
- **Syntax ใน Zed**: ใช้สีจาก Coding kit ของ DS (keyword magenta · string เขียว · number เหลือง · type plum · function rose · comment เทาเอียง)
- **ANSI blue/cyan**: เป็นสีที่ไม่มีใน DS เพราะสีแบรนด์ทั้งหมดอยู่ในช่วง hue 330°–18° ถ้าใช้สีแบรนด์อย่างเดียวจะแยก red กับ rose ไม่ออก
- **`tokens/extras.json`** เก็บ 3 อย่าง:
  - `night`: palette ของ Terminal kit
  - `ansi`: ANSI ของทั้งสองโหมด (ช่อง bright ที่ไม่ได้ระบุ script คำนวณให้เอง)
  - `relevel`: token ของ DS ที่ contrast ไม่ถึงเกณฑ์ ถูกปรับเฉพาะค่า L (hue กับ chroma คงเดิม) จนได้ ≥ 4.6:1

## Contrast gate

`scripts/build.mjs` ตรวจ contrast ทุกคู่สีตัวอักษรกับพื้น (มาตรฐาน WCAG 2) ถ้ามีคู่ไหนไม่ผ่าน script จะ **ไม่เขียนไฟล์ใดๆ** และจบด้วย exit 1

- ตัวอักษร, syntax และ ANSI ต้องได้ ≥ 4.5:1
- comment, hint และ bright black ต้องได้ ≥ 3:1
- cursor ต้องได้ ≥ 3:1
- ช่อง ANSI black/white และช่อง dim ของ Zed ไม่ถูกตรวจ

## เมื่อ Design System เปลี่ยน (rebuild)

ต้องใช้ Node 18 ขึ้นไป

1. ดาวน์โหลด `colors_and_type.css` ตัวล่าสุดจาก DS project มาวางทับ `tokens/colors_and_type.css`
2. รัน `node scripts/build.mjs`
3. ถ้ามีบรรทัด `FAIL` ให้แก้ค่า L ใน `tokens/extras.json` (ในส่วน `relevel` หรือ `ansi`) โดยคง hue กับ chroma เดิมไว้ แล้วรันใหม่จนผ่าน
4. ดู `git diff` ของ `warp/` และ `zed/` แล้วรัน `./install.sh` จากนั้น commit

## เพิ่มโปรแกรมใหม่

1. สร้างโฟลเดอร์ `<ชื่อโปรแกรม>/` ให้มีไฟล์ theme ที่ build ได้, `install.sh` (แค่ copy และรองรับ `--uninstall`) และ `README.md`
2. เพิ่มฟังก์ชันสร้าง theme ของโปรแกรมนั้นใน `scripts/build.mjs` พร้อมจุดตรวจ contrast
3. เรียก `install.sh` ของโปรแกรมใหม่จาก `./install.sh` ที่ root
