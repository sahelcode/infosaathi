"""Wrap the agent-knowledge .txt files into .docx (WhatsApp Business AI does not accept .txt)."""
import pathlib
from docx import Document
from docx.shared import Pt
d = pathlib.Path(__file__).resolve().parent.parent / "agent-knowledge"
for name in ("doctors", "universities", "hospitals"):
    doc = Document()
    doc.styles["Normal"].font.size = Pt(10)
    for line in (d / f"knowledge-{name}.txt").read_text(encoding="utf-8").split("\n"):
        if line.strip():
            doc.add_paragraph(line)
    doc.save(d / f"knowledge-{name}.docx")
print("docx ok")
