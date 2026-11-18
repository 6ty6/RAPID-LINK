from __future__ import annotations

import html
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "RAPIDLINK_PROJECT_TECHNICAL_DEBRIEF_2026-11-18.md"
DESTINATION = ROOT / "docs" / "RapidLink Website Project Technical Debrief - 18 November 2026.docx"
LOGO = ROOT / "public" / "assets" / "rapidlink-logo-400.png"

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
PIC = "http://schemas.openxmlformats.org/drawingml/2006/picture"


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def bookmark(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9_]", "_", value)
    return ("h_" + value)[:38]


def slug(value: str) -> str:
    value = re.sub(r"[^a-z0-9\s-]", "", value.lower())
    return re.sub(r"[-\s]+", "-", value).strip("-")


class DocumentBuilder:
    def __init__(self) -> None:
        self.parts: list[str] = []
        self.relationships: list[str] = []
        self.relationship_id = 4
        self.bookmark_id = 1

    def relationship(self, target: str, relationship_type: str, external: bool = False) -> str:
        relationship_id = f"rId{self.relationship_id}"
        self.relationship_id += 1
        mode = ' TargetMode="External"' if external else ""
        self.relationships.append(
            f'<Relationship Id="{relationship_id}" Type="{relationship_type}" Target="{esc(target)}"{mode}/>'
        )
        return relationship_id

    def run(self, text: str, bold: bool = False, italic: bool = False, code: bool = False, color: str | None = None) -> str:
        properties: list[str] = []
        if bold:
            properties.append("<w:b/>")
        if italic:
            properties.append("<w:i/>")
        if code:
            properties.extend(("<w:rFonts w:ascii=\"Consolas\" w:hAnsi=\"Consolas\"/>", "<w:sz w:val=\"18\"/>", "<w:color w:val=\"8B3E12\"/>"))
        if color:
            properties.append(f'<w:color w:val="{color}"/>')
        props = f"<w:rPr>{''.join(properties)}</w:rPr>" if properties else ""
        space = ' xml:space="preserve"' if text[:1].isspace() or text[-1:].isspace() else ""
        return f"<w:r>{props}<w:t{space}>{esc(text)}</w:t></w:r>"

    def inline_runs(self, text: str) -> str:
        pattern = re.compile(r"(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)")
        cursor = 0
        output: list[str] = []
        for match in pattern.finditer(text):
            if match.start() > cursor:
                output.append(self.run(text[cursor:match.start()]))
            if match.group(2) is not None:
                label, target = match.group(2), match.group(3)
                if target.startswith("#"):
                    output.append(f'<w:hyperlink w:anchor="{bookmark(target[1:])}" w:history="1">{self.run(label, color="0B57A3")}</w:hyperlink>')
                else:
                    rel = self.relationship(target, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", True)
                    output.append(f'<w:hyperlink r:id="{rel}" w:history="1">{self.run(label, color="0B57A3")}</w:hyperlink>')
            elif match.group(4) is not None:
                output.append(self.run(match.group(4), code=True))
            elif match.group(5) is not None:
                output.append(self.run(match.group(5), bold=True))
            else:
                output.append(self.run(match.group(6), italic=True))
            cursor = match.end()
        if cursor < len(text):
            output.append(self.run(text[cursor:]))
        return "".join(output)

    def paragraph(self, text: str = "", style: str | None = None, before: int = 0, after: int = 120, indent: int = 0, keep: bool = False) -> None:
        properties: list[str] = []
        if style:
            properties.append(f'<w:pStyle w:val="{style}"/>')
        if before or after:
            properties.append(f'<w:spacing w:before="{before}" w:after="{after}"/>')
        if indent:
            properties.append(f'<w:ind w:left="{indent}" w:hanging="360"/>')
        if keep:
            properties.append("<w:keepNext/>")
        props = f"<w:pPr>{''.join(properties)}</w:pPr>" if properties else ""
        self.parts.append(f"<w:p>{props}{self.inline_runs(text)}</w:p>")

    def heading(self, level: int, title: str, page_break: bool = False) -> None:
        bookmark_name = bookmark(slug(title))
        bookmark_id = self.bookmark_id
        self.bookmark_id += 1
        page = "<w:pageBreakBefore/>" if page_break else ""
        self.parts.append(
            f'<w:p><w:pPr><w:pStyle w:val="Heading{level}"/>{page}<w:keepNext/></w:pPr>'
            f'<w:bookmarkStart w:id="{bookmark_id}" w:name="{bookmark_name}"/>'
            f'{self.inline_runs(title)}<w:bookmarkEnd w:id="{bookmark_id}"/></w:p>'
        )

    def page_break(self) -> None:
        self.parts.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')

    def list_item(self, text: str, ordered: bool, number: int = 1, depth: int = 0) -> None:
        marker = f"{number}." if ordered else "•"
        left = 540 + depth * 360
        self.parts.append(
            f'<w:p><w:pPr><w:spacing w:after="60"/><w:ind w:left="{left}" w:hanging="300"/></w:pPr>'
            f'{self.run(marker + " ", bold=ordered)}{self.inline_runs(text)}</w:p>'
        )

    def code_block(self, lines: list[str], language: str) -> None:
        label = self.run(language.upper(), bold=True, color="647587") if language else ""
        content: list[str] = []
        for index, line in enumerate(lines):
            if index:
                content.append("<w:r><w:br/></w:r>")
            content.append(self.run(line or " ", code=True))
        self.parts.append(
            '<w:p><w:pPr><w:spacing w:before="120" w:after="140"/><w:shd w:fill="F2F5F8"/>'
            '<w:ind w:left="180" w:right="120"/><w:pBdr><w:left w:val="single" w:sz="18" w:color="EF7622"/></w:pBdr></w:pPr>'
            f'{label}{"<w:r><w:br/></w:r>" if label else ""}{"".join(content)}</w:p>'
        )

    def table(self, headers: list[str], rows: list[list[str]]) -> None:
        columns = max(1, len(headers))
        width = 9360 // columns

        def cell(text: str, header: bool = False) -> str:
            shade = '<w:shd w:fill="103A71"/>' if header else ""
            runs = self.run(text, bold=header, color="FFFFFF" if header else None)
            return f'<w:tc><w:tcPr><w:tcW w:w="{width}" w:type="dxa"/>{shade}<w:tcMar><w:top w:w="90" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tcMar></w:tcPr><w:p>{runs}</w:p></w:tc>'

        table_rows = ["<w:tr>" + "".join(cell(item, True) for item in headers) + "</w:tr>"]
        for row in rows:
            padded = row + [""] * (columns - len(row))
            table_rows.append("<w:tr>" + "".join(cell(item) for item in padded[:columns]) + "</w:tr>")
        self.parts.append(
            '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>'
            '<w:top w:val="single" w:sz="4" w:color="BDCAD6"/><w:left w:val="single" w:sz="4" w:color="BDCAD6"/>'
            '<w:bottom w:val="single" w:sz="4" w:color="BDCAD6"/><w:right w:val="single" w:sz="4" w:color="BDCAD6"/>'
            '<w:insideH w:val="single" w:sz="4" w:color="BDCAD6"/><w:insideV w:val="single" w:sz="4" w:color="BDCAD6"/>'
            '</w:tblBorders></w:tblPr>' + "".join(table_rows) + '</w:tbl><w:p><w:pPr><w:spacing w:after="100"/></w:pPr></w:p>'
        )

    def logo(self) -> None:
        if not LOGO.exists():
            return
        drawing = f"""<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="360"/></w:pPr><w:r><w:drawing>
<wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="1880000" cy="870000"/><wp:docPr id="1" name="RapidLink logo"/>
<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>
<pic:nvPicPr><pic:cNvPr id="0" name="rapidlink-logo-400.png"/><pic:cNvPicPr/></pic:nvPicPr>
<pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1880000" cy="870000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>"""
        self.parts.append(drawing)


def parse_source(builder: DocumentBuilder, markdown: str) -> None:
    lines = markdown.replace("\r\n", "\n").split("\n")
    i = 0
    while i < len(lines) and lines[i].strip() != "## Executive summary":
        i += 1
    skip_toc = False
    paragraph: list[str] = []
    code: list[str] | None = None
    language = ""
    ordered_number = 0

    def flush() -> None:
        if paragraph:
            builder.paragraph(" ".join(part.strip() for part in paragraph))
            paragraph.clear()

    while i < len(lines):
        line = lines[i]
        value = line.strip()

        if value == "## Table of contents":
            flush()
            skip_toc = True
            i += 1
            continue
        if skip_toc:
            if value == "---":
                skip_toc = False
            i += 1
            continue

        if code is not None:
            if value.startswith("```"):
                builder.code_block(code, language)
                code = None
                language = ""
            else:
                code.append(line)
            i += 1
            continue
        if value.startswith("```"):
            flush()
            code = []
            language = value[3:].strip()
            i += 1
            continue

        heading = re.match(r"^(#{1,6})\s+(.+)$", value)
        if heading:
            flush()
            level = len(heading.group(1))
            builder.heading(level, heading.group(2).strip(), page_break=(level == 1))
            i += 1
            continue

        if value.startswith("|") and i + 1 < len(lines):
            divider = [part.strip() for part in lines[i + 1].strip().strip("|").split("|")]
            if divider and all(re.fullmatch(r":?-{3,}:?", part) for part in divider):
                flush()
                headers = [part.strip() for part in value.strip("|").split("|")]
                rows: list[list[str]] = []
                i += 2
                while i < len(lines) and lines[i].strip().startswith("|"):
                    rows.append([part.strip().replace("`", "") for part in lines[i].strip().strip("|").split("|")])
                    i += 1
                builder.table([item.replace("`", "") for item in headers], rows)
                continue

        item = re.match(r"^(\s*)([-*]|\d+\.)\s+(.+)$", line)
        if item:
            flush()
            ordered = item.group(2)[0].isdigit()
            ordered_number = ordered_number + 1 if ordered else 0
            builder.list_item(item.group(3), ordered, ordered_number or 1, len(item.group(1)) // 3)
            i += 1
            continue
        ordered_number = 0

        if value == "---":
            flush()
            builder.paragraph("", after=80)
        elif not value:
            flush()
        else:
            paragraph.append(value.rstrip("  "))
        i += 1
    flush()


def styles_xml() -> str:
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="{W}">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="21"/><w:color w:val="1B2B3B"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="180"/></w:pPr><w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:color w:val="103A71"/><w:sz w:val="56"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr><w:rPr><w:b/><w:color w:val="EF7622"/><w:sz w:val="34"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="300" w:after="150"/><w:outlineLvl w:val="0"/><w:pBdr><w:bottom w:val="single" w:sz="12" w:color="EF7622"/></w:pBdr></w:pPr><w:rPr><w:b/><w:color w:val="103A71"/><w:sz w:val="44"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="240" w:after="110"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:color w:val="103A71"/><w:sz w:val="32"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="180" w:after="90"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:color w:val="2A5B91"/><w:sz w:val="26"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading4"><w:name w:val="heading 4"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:outlineLvl w:val="3"/></w:pPr><w:rPr><w:b/><w:color w:val="324B62"/><w:sz w:val="23"/></w:rPr></w:style>
</w:styles>'''


def make_document() -> tuple[str, str]:
    builder = DocumentBuilder()
    builder.logo()
    builder.parts.append('<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>RapidLink Website Project</w:t></w:r></w:p>')
    builder.parts.append('<w:p><w:pPr><w:pStyle w:val="Subtitle"/></w:pPr><w:r><w:t>Technical Project Debrief</w:t></w:r></w:p>')
    builder.paragraph("Status date: 18 November 2026", before=600, after=90)
    builder.paragraph("Purpose: Project handover and technical review", after=90)
    builder.paragraph("Working branch: cms-evaluation/sanity", after=90)
    builder.paragraph("Production domain: rapidlinkgh.com", after=90)
    builder.page_break()

    builder.heading(1, "Table of contents")
    source_text = SOURCE.read_text(encoding="utf-8")
    headings = re.findall(r"^(#{1,2})\s+(.+)$", source_text, flags=re.MULTILINE)
    toc_number = 0
    for marks, title in headings:
        title = title.strip()
        if title in {"RapidLink Website Project — Technical Debrief", "Table of contents"}:
            continue
        if len(marks) == 1:
            toc_number += 1
            prefix = f"{toc_number}. " if not re.match(r"^\d+\.", title) else ""
            builder.parts.append(f'<w:p><w:pPr><w:spacing w:after="80"/><w:ind w:left="0"/></w:pPr><w:hyperlink w:anchor="{bookmark(slug(title))}" w:history="1">{builder.run(prefix + title, bold=True, color="103A71")}</w:hyperlink></w:p>')
        else:
            builder.parts.append(f'<w:p><w:pPr><w:spacing w:after="45"/><w:ind w:left="420"/></w:pPr><w:hyperlink w:anchor="{bookmark(slug(title))}" w:history="1">{builder.run(title, color="2A5B91")}</w:hyperlink></w:p>')
    builder.page_break()
    parse_source(builder, source_text)

    section = '<w:sectPr><w:headerReference w:type="default" r:id="rId2"/><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1191" w:right="1021" w:bottom="1134" w:left="1021" w:header="600" w:footer="600"/><w:cols w:space="708"/></w:sectPr>'
    document = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="{W}" xmlns:r="{R}" xmlns:wp="{WP}" xmlns:a="{A}" xmlns:pic="{PIC}"><w:body>{''.join(builder.parts)}{section}</w:body></w:document>'''
    rels = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/rapidlink-logo-400.png"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
{''.join(builder.relationships)}</Relationships>'''
    return document, rels


def write_docx() -> None:
    document, document_rels = make_document()
    timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'''
    package_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>'''
    core = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>RapidLink Website Project — Technical Debrief</dc:title><dc:subject>Project handover and technical review</dc:subject><dc:creator>RapidLink Website Project</dc:creator><cp:lastModifiedBy>RapidLink Website Project</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">{timestamp}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">{timestamp}</dcterms:modified></cp:coreProperties>'''
    app = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Microsoft Office Word</Application><AppVersion>16.0000</AppVersion></Properties>'''
    settings = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="{W}"><w:zoom w:percent="100"/><w:updateFields w:val="true"/><w:defaultTabStop w:val="720"/></w:settings>'''
    header = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="{W}"><w:p><w:pPr><w:jc w:val="right"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:color="EF7622"/></w:pBdr></w:pPr><w:r><w:rPr><w:color w:val="667788"/><w:sz w:val="16"/></w:rPr><w:t>RapidLink Website Project | Technical Debrief</w:t></w:r></w:p></w:hdr>'''
    footer = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="{W}"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:color w:val="667788"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/><w:instrText> PAGE </w:instrText><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>'''

    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(DESTINATION, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types)
        archive.writestr("_rels/.rels", package_rels)
        archive.writestr("docProps/core.xml", core)
        archive.writestr("docProps/app.xml", app)
        archive.writestr("word/document.xml", document)
        archive.writestr("word/styles.xml", styles_xml())
        archive.writestr("word/settings.xml", settings)
        archive.writestr("word/header1.xml", header)
        archive.writestr("word/footer1.xml", footer)
        archive.writestr("word/_rels/document.xml.rels", document_rels)
        if LOGO.exists():
            archive.write(LOGO, "word/media/rapidlink-logo-400.png")
    print(DESTINATION)


if __name__ == "__main__":
    write_docx()
