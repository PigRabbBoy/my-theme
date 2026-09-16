# my-theme — PigRabb Themes

theme สีสำหรับโปรแกรมที่ใช้ทุกวัน สีทั้งหมดมาจาก **PigRabb Studio Design System** แต่ละโปรแกรมมีโฟลเดอร์ของตัวเอง และมีทั้ง Light กับ Dark ให้เลือกว่าจะสลับตามโหมดของ macOS หรือล็อกไว้โหมดเดียว

| โปรแกรม | โฟลเดอร์ | ชื่อ theme | สลับตาม macOS เองได้ | วิธีติดตั้ง |
|---|---|---|---|---|
| Warp Terminal | [`warp/`](warp/README.md) | PigRabb Light · PigRabb Dark | ได้ | [warp/README.md](warp/README.md) |
| Zed Editor | [`zed/`](zed/README.md) | PigRabb Light · PigRabb Dark | ได้ | [zed/README.md](zed/README.md) |
| macOS Terminal | [`macos-terminal/`](macos-terminal/README.md) | PigRabb Light · PigRabb Dark | ไม่ได้ (ใช้เครื่องมือเสริม) | [macos-terminal/README.md](macos-terminal/README.md) |
| DBeaver | [`dbeaver/`](dbeaver/README.md) | PigRabb Light · PigRabb Dark | ไม่ได้ | [dbeaver/README.md](dbeaver/README.md) |

## ติดตั้งแบบเร็ว (macOS)

```sh
git clone https://github.com/PigRabbBoy/my-theme.git
cd my-theme
./install.sh
```

- สำหรับ Warp และ Zed `install.sh` แค่ **copy ไฟล์ theme** ไปไว้ในโฟลเดอร์ของแต่ละโปรแกรม ไม่แก้ไฟล์ settings ใดๆ
- macOS Terminal ไม่มีโฟลเดอร์ theme `install.sh` จึง **import profile** ด้วยการ `open` ไฟล์ `.terminal` แทน ตอนรันครั้งแรกจะมีหน้าต่าง macOS Terminal เปิดขึ้นมา 2 หน้าต่าง ถ้า profile มีอยู่แล้วจะข้ามไป
- DBeaver ไม่มีโฟลเดอร์ theme ของผู้ใช้ `install.sh` จึง **วาง plugin ลงใน DBeaver.app** และเพิ่ม 1 บรรทัดใน `bundles.info` ต้องปิด DBeaver ก่อน (ถ้าเปิดอยู่ script จะหยุดที่ DBeaver ซึ่งถูกเรียกเป็นลำดับสุดท้าย) และต้องรันใหม่ทุกครั้งหลัง `brew upgrade --cask dbeaver-community`
- จากนั้นต้องเลือก theme เองตามขั้นตอนใน README ของแต่ละโปรแกรม
- ไม่ต้องติดตั้ง Node เพราะไฟล์ theme ถูก build ไว้ใน repo แล้ว
- ใช้วิธี copy ไม่ใช้ symlink ดังนั้นหลังติดตั้งจะย้ายหรือลบ repo ทิ้งก็ได้
- ถ้าจะถอนการติดตั้ง ให้รัน `./install.sh --uninstall` (แนะนำให้เปลี่ยน theme ใน settings กลับก่อน) ส่วน profile ของ macOS Terminal ต้องลบเองใน Settings script จะพิมพ์ขั้นตอนให้ และ DBeaver ต้องปิดโปรแกรมก่อน

## Font ที่แนะนำ

theme ของ Warp, Zed และ macOS Terminal กำหนด font ไม่ได้ ต้องตั้งเอง ส่วน DBeaver ตั้งให้ใน theme เลย DS ใช้ **JetBrains Mono** สำหรับโค้ด และ **Geist** สำหรับ UI

```sh
brew install --cask font-jetbrains-mono font-geist
```

- Zed: ใส่ `"buffer_font_family": "JetBrains Mono"` และ `"ui_font_family": "Geist"` ใน `settings.json`
- Warp: Settings → Appearance → Text → Terminal font → เลือก JetBrains Mono
- macOS Terminal: Settings → Profiles → เลือก profile → Text → Font → Change… (profile PigRabb ใช้ SF Mono Terminal 11pt เหมือน `Basic` เป็นค่าเริ่มต้น)
- DBeaver: theme ตั้ง JetBrains Mono 14pt ให้ใน SQL editor, ตารางผลลัพธ์, panel และ console ถ้าเครื่องไม่มีจะใช้ SF Mono หรือ Menlo แทน

## โครงสร้าง repo

```
tokens/colors_and_type.css   token ของ DS ที่ copy มาทั้งไฟล์ (ห้ามแก้เอง)
tokens/extras.json           สีที่ DS ไม่มี (ดูหัวข้อถัดไป)
scripts/build.mjs            แปลง OKLCH เป็น hex, สร้างไฟล์ theme, ตรวจ contrast
warp/                        theme ของ Warp + install.sh + README
zed/                         theme ของ Zed + install.sh + README
macos-terminal/              profile ของ macOS Terminal + install.sh + README
dbeaver/                     plugin theme ของ DBeaver + install.sh + README
CONTEXT.md                   คำศัพท์ที่ใช้ในโปรเจกต์
```

## สีมาจากไหน

- **Token ของ DS**: role token ทั้งหมด (`--bg-surface`, `--text-primary`, …) เปลี่ยนตามโหมด light/dark ตาม `[data-theme="dark"]`
- **Dark ของ Warp และ macOS Terminal**: ใช้ palette กลางคืนของ Terminal kit ใน DS ตรงๆ (พื้น `#181117`)
- **Light ของ Warp และ macOS Terminal**: สร้างจาก token โหมดสว่าง **เป็นการตั้งใจไม่ทำตาม DS** เพราะ Terminal kit กำหนดให้ terminal มืดเสมอ
- **ANSI**: แต่ละโหมดมี ANSI ชุดเดียว ใช้ร่วมกันใน Warp, terminal panel ของ Zed และ macOS Terminal
- **Syntax ใน Zed**: ใช้สีจาก Coding kit ของ DS (keyword magenta · string เขียว · number เหลือง · type plum · function rose · comment เทาเอียง)
- **DBeaver**: ใช้ role token และสี syntax ชุดเดียวกับ Zed ส่วนตารางผลลัพธ์ใช้เฉพาะสีที่อ่านออกบนพื้นแถวทุกแบบ
- **ANSI blue/cyan**: เป็นสีที่ไม่มีใน DS เพราะสีแบรนด์ทั้งหมดอยู่ในช่วง hue 330°–18° ถ้าใช้สีแบรนด์อย่างเดียวจะแยก red กับ rose ไม่ออก
- **`tokens/extras.json`** เก็บ 3 อย่าง:
  - `night`: palette ของ Terminal kit
  - `ansi`: ANSI ของทั้งสองโหมด (ช่อง bright ที่ไม่ได้ระบุ script คำนวณให้เอง)
  - `relevel`: token ของ DS ที่ contrast ไม่ถึงเกณฑ์ ถูกปรับเฉพาะค่า L (hue กับ chroma คงเดิม) จนได้ ≥ 4.6:1 ใช้กับทุกโปรแกรม (Light `violet-500`, `cyan-700`, `pink-700` ลดเหลือ 53% เพื่อให้อ่านออกบนบรรทัดปัจจุบันของ DBeaver ด้วย)

## Contrast gate

`scripts/build.mjs` ตรวจ contrast ทุกคู่สีตัวอักษรกับพื้น (มาตรฐาน WCAG 2) ถ้ามีคู่ไหนไม่ผ่าน script จะ **ไม่เขียนไฟล์ใดๆ** และจบด้วย exit 1

- ตัวอักษร, syntax และ ANSI ต้องได้ ≥ 4.5:1
- comment, hint และ bright black ต้องได้ ≥ 3:1
- cursor ต้องได้ ≥ 3:1
- ตัวอักษรบน selection ของ macOS Terminal ต้องได้ ≥ 4.5:1
- DBeaver ตรวจทุกพื้นที่ตัวอักษรวางจริง: syntax บนพื้น editor และบรรทัดปัจจุบัน, ค่าในตารางบนแถวปกติ/แถวคี่/selection/แถวใหม่/แก้ไข/ลบ, header ตาราง, แท็บ, navigator และ hover
- ช่อง ANSI black/white และช่อง dim ของ Zed ไม่ถูกตรวจ

## เมื่อ Design System เปลี่ยน (rebuild)

ต้องใช้ Node 18 ขึ้นไป

1. ดาวน์โหลด `colors_and_type.css` ตัวล่าสุดจาก DS project มาวางทับ `tokens/colors_and_type.css`
2. รัน `node scripts/build.mjs`
3. ถ้ามีบรรทัด `FAIL` ให้แก้ค่า L ใน `tokens/extras.json` (ในส่วน `relevel` หรือ `ansi`) โดยคง hue กับ chroma เดิมไว้ แล้วรันใหม่จนผ่าน
4. ดู `git diff` ของ `warp/`, `zed/`, `macos-terminal/` และ `dbeaver/` แล้วรัน `./install.sh` จากนั้น commit (profile ของ macOS Terminal ต้องลบของเดิมก่อน ดู [macos-terminal/README.md](macos-terminal/README.md) และ DBeaver ต้องปิดก่อน)

## เพิ่มโปรแกรมใหม่

1. สร้างโฟลเดอร์ `<ชื่อโปรแกรม>/` ให้มีไฟล์ theme ที่ build ได้, `install.sh` (copy/import ไฟล์หรือวาง plugin เท่านั้น ห้ามเขียนไฟล์ settings ของผู้ใช้เอง และรองรับ `--uninstall`) และ `README.md`
2. เพิ่มฟังก์ชันสร้าง theme ของโปรแกรมนั้นใน `scripts/build.mjs` พร้อมจุดตรวจ contrast
3. เรียก `install.sh` ของโปรแกรมใหม่จาก `./install.sh` ที่ root
