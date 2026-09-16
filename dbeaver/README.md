# DBeaver — PigRabb Light / PigRabb Dark

| ไฟล์ | คืออะไร |
|---|---|
| `plugin/` | plugin ของ Eclipse ที่มี theme **PigRabb Dark** และ **PigRabb Light** (`plugin.xml`, `META-INF/MANIFEST.MF`, `css/`) |
| `install.sh` | วาง plugin ลงใน DBeaver.app และถอนออก |

- สีชุดเดียวกับ Zed ของแต่ละโหมด: กรอบหน้าต่างใช้ `bg-page`, editor/ตาราง/panel ใช้ `bg-surface`, syntax ใช้สีจาก Coding kit
- SQL editor: keyword magenta · datatype/schema/table plum · function rose · column pink · string เขียว · number/parameter เหลือง · comment เทา
- ตารางผลลัพธ์: ตัวเลขและ boolean เหลือง · วันที่เขียว · NULL เทา · แถวใหม่/แก้ไข/ลบ เป็นพื้นเขียว/เหลือง/แดงอ่อน
- **font**: SQL editor, ตารางผลลัพธ์, panel และ console ใช้ **JetBrains Mono 14pt** (`--font-mono`, `--text-sm` ของ DS) ถ้าเครื่องไม่มีจะใช้ SF Mono และ Menlo ตามลำดับ ส่วน UI ใช้ font ของ macOS

> ไฟล์ใน `plugin/` ถูกสร้างโดย `scripts/build.mjs` ถ้าจะเปลี่ยนสี ให้แก้ใน `tokens/` แล้ว build ใหม่ ห้ามแก้ไฟล์ตรงๆ

## ต่างจากโปรแกรมอื่นยังไง

- **ไม่มีโฟลเดอร์ theme ของผู้ใช้**: DBeaver อ่าน theme จาก plugin เท่านั้น script จึงวาง plugin ลงใน `DBeaver.app` และเพิ่ม 1 บรรทัดใน `bundles.info` ของแอป
- **`brew upgrade --cask dbeaver-community` ลบ plugin ทิ้ง** เพราะเปลี่ยนทั้ง `DBeaver.app` ต้องรัน `./dbeaver/install.sh` ใหม่ทุกครั้งหลังอัปเดต DBeaver
- **สลับ Light/Dark ตาม macOS เองไม่ได้**: เลือก theme แล้ว DBeaver จะใช้ theme นั้นจนกว่าจะเปลี่ยนเอง
- **ตั้ง font ให้ด้วย**: เป็นโปรแกรมเดียวใน repo นี้ที่ theme กำหนด font

## ติดตั้ง

1. **ปิด DBeaver** (script จะหยุดถ้า DBeaver ยังเปิดอยู่ ไม่ปิดโปรแกรมให้ เพราะอาจมีงานที่ยังไม่ได้บันทึก)
2. วาง plugin

   ```sh
   ./dbeaver/install.sh     # หรือ ./install.sh ที่ root เพื่อติดตั้งทุกโปรแกรม
   ```

   script จะ copy `plugin/` ไปที่ `DBeaver.app/Contents/Eclipse/plugins/com.pigrabb.dbeaver.themes_<version>/` แล้วเพิ่มบรรทัดใน `Contents/Eclipse/configuration/org.eclipse.equinox.simpleconfigurator/bundles.info` (สำรองของเดิมไว้เป็น `bundles.info.bak`) รันซ้ำได้ ถ้าเป็น version เดิมจะไม่ทำอะไร

   ถ้า DBeaver ไม่ได้อยู่ที่ `/Applications/DBeaver.app` ให้ระบุเอง: `DBEAVER_APP=/path/to/DBeaver.app ./dbeaver/install.sh`

3. เปิด DBeaver → Settings (⌘,) → User Interface → Appearance → Theme → เลือก **PigRabb Dark** หรือ **PigRabb Light** → Apply แล้วกด restart เมื่อ DBeaver ถาม
4. ถ้ายังไม่มี JetBrains Mono

   ```sh
   brew install --cask font-jetbrains-mono
   ```

   แล้ว restart DBeaver

## อัปเดต

ใช้ขั้นตอนเดียวกันทั้งหลัง build ใหม่และหลัง `brew upgrade --cask dbeaver-community`

1. ปิด DBeaver
2. รัน `./dbeaver/install.sh` (ถ้า version เปลี่ยน script จะลบ version เก่าออกให้)
3. เปิด DBeaver theme ที่เลือกไว้ยังอยู่ ไม่ต้องเลือกใหม่

## ถอนการติดตั้ง

1. Settings → User Interface → Appearance → Theme → เลือก theme เดิม (Dark หรือ Light) แล้ว restart ถ้าข้ามข้อนี้ DBeaver จะกลับไปใช้ Dark เอง
2. ปิด DBeaver แล้วรัน

   ```sh
   ./dbeaver/install.sh --uninstall
   ```

3. ถ้า font ยังเป็น JetBrains Mono อยู่: Settings → User Interface → Appearance → Colors and Fonts → เลือก font นั้น → Reset (DBeaver อาจเก็บ font ไว้เป็นค่าของผู้ใช้)

## แก้ปัญหา

- **ไม่มี PigRabb ในรายการ Theme**: รัน `install.sh` ตอน DBeaver ปิดอยู่หรือยัง และเพิ่งอัปเดต DBeaver หรือเปล่า ถ้ายังไม่เจอ ดู error ใน `~/Library/DBeaverData/workspace6/.metadata/.log`
- **font เป็น Menlo**: เครื่องนี้ยังไม่มี JetBrains Mono ดูขั้นตอนที่ 4 ของหัวข้อติดตั้ง
- **สีบางส่วนไม่เปลี่ยน**: สีที่เคยแก้เองใน Settings → Colors and Fonts จะชนะ theme ให้กด Reset ที่สีนั้น
- **script บอกให้ปิด DBeaver**: ปิดให้หมดทุกหน้าต่าง (⌘Q) แล้วรันใหม่
- **script ข้ามไปเฉยๆ**: ไม่เจอ `DBeaver.app` ที่ `/Applications` ให้ใช้ `DBEAVER_APP` ตามขั้นตอนที่ 2

## สิ่งที่ theme ของ DBeaver ทำไม่ได้

- สลับ Light/Dark ตามโหมดของ macOS
- ลงสีส่วนที่ macOS วาดเอง ได้แก่ เมนู, dialog, title bar, scrollbar และแถบ highlight ของแถวที่เลือกใน tree
- ใช้สี magenta, plum, rose และ pink ในตารางผลลัพธ์ เพราะอ่านไม่ออกบนพื้นแถวคี่และแถวสถานะ
- ใช้กับ DBeaver บน Windows หรือ Linux (theme ลงทะเบียนเฉพาะ macOS)
