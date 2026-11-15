param(
    [string]$SourcePath = (Join-Path $PSScriptRoot '..\docs\rapidlink-content-models.md'),
    [string]$OutputPath = (Join-Path $PSScriptRoot '..\docs\RapidLink Website Content Models - Caleb Adom Awuah.docx')
)

$ErrorActionPreference = 'Stop'

function Convert-InlineMarkdown {
    param([string]$Text)

    $encoded = [System.Net.WebUtility]::HtmlEncode($Text)
    $encoded = [regex]::Replace($encoded, '\*\*(.+?)\*\*', '<strong>$1</strong>')
    $encoded = [regex]::Replace($encoded, '`(.+?)`', '<code>$1</code>')
    $encoded = [regex]::Replace($encoded, '(https?://[^\s<]+)', '<a href="$1">$1</a>')
    return $encoded
}

$source = (Resolve-Path -LiteralPath $SourcePath).Path
$output = [System.IO.Path]::GetFullPath($OutputPath)
$lines = Get-Content -LiteralPath $source -Encoding UTF8
$body = [System.Text.StringBuilder]::new()
$listType = $null
$paragraphLines = [System.Collections.Generic.List[string]]::new()

function Close-Paragraph {
    if ($paragraphLines.Count -gt 0) {
        $text = ($paragraphLines -join ' ').Trim()
        if ($text) {
            [void]$body.AppendLine("<p>$(Convert-InlineMarkdown $text)</p>")
        }
        $paragraphLines.Clear()
    }
}

function Close-List {
    if ($script:listType) {
        [void]$body.AppendLine("</$script:listType>")
        $script:listType = $null
    }
}

$index = 0
while ($index -lt $lines.Count) {
    $line = $lines[$index]
    $trimmed = $line.Trim()

    if ($trimmed -eq '---') {
        Close-Paragraph
        Close-List
        [void]$body.AppendLine('<hr>')
        $index++
        continue
    }

    if ($trimmed -match '^(#{1,4})\s+(.+)$') {
        Close-Paragraph
        Close-List
        $level = $matches[1].Length
        [void]$body.AppendLine("<h$level>$(Convert-InlineMarkdown $matches[2])</h$level>")
        $index++
        continue
    }

    if ($trimmed.StartsWith('|') -and ($index + 1) -lt $lines.Count -and $lines[$index + 1].Trim() -match '^\|?[\s:-]+\|') {
        Close-Paragraph
        Close-List
        $headers = $trimmed.Trim('|').Split('|') | ForEach-Object { $_.Trim() }
        [void]$body.AppendLine('<table><thead><tr>')
        foreach ($header in $headers) {
            [void]$body.AppendLine("<th>$(Convert-InlineMarkdown $header)</th>")
        }
        [void]$body.AppendLine('</tr></thead><tbody>')
        $index += 2
        while ($index -lt $lines.Count -and $lines[$index].Trim().StartsWith('|')) {
            $cells = $lines[$index].Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() }
            [void]$body.AppendLine('<tr>')
            foreach ($cell in $cells) {
                [void]$body.AppendLine("<td>$(Convert-InlineMarkdown $cell)</td>")
            }
            [void]$body.AppendLine('</tr>')
            $index++
        }
        [void]$body.AppendLine('</tbody></table>')
        continue
    }

    if ($trimmed -match '^[-*]\s+(.+)$') {
        Close-Paragraph
        if ($listType -ne 'ul') {
            Close-List
            $listType = 'ul'
            [void]$body.AppendLine('<ul>')
        }
        [void]$body.AppendLine("<li>$(Convert-InlineMarkdown $matches[1])</li>")
        $index++
        continue
    }

    if ($trimmed -match '^\d+\.\s+(.+)$') {
        Close-Paragraph
        if ($listType -ne 'ol') {
            Close-List
            $listType = 'ol'
            [void]$body.AppendLine('<ol>')
        }
        [void]$body.AppendLine("<li>$(Convert-InlineMarkdown $matches[1])</li>")
        $index++
        continue
    }

    if (-not $trimmed) {
        Close-Paragraph
        Close-List
        $index++
        continue
    }

    $paragraphLines.Add($trimmed)
    $index++
}

Close-Paragraph
Close-List

$html = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>RapidLink Website Content Models and Governance Specification</title>
<style>
@page { size: A4; margin: 2.1cm 1.8cm 2cm 1.8cm; }
body { font-family: Aptos, Calibri, Arial, sans-serif; color: #153047; font-size: 10.5pt; line-height: 1.38; }
h1 { color: #123650; font-size: 25pt; line-height: 1.08; margin: 0 0 22pt; padding-bottom: 10pt; border-bottom: 4pt solid #f36c21; }
h2 { color: #0b3cc1; font-size: 16pt; margin: 22pt 0 8pt; border-bottom: 1pt solid #d7e0e8; padding-bottom: 4pt; page-break-after: avoid; }
h3 { color: #123650; font-size: 12.5pt; margin: 16pt 0 5pt; page-break-after: avoid; }
h4 { color: #0b3cc1; font-size: 11pt; margin: 12pt 0 4pt; page-break-after: avoid; }
p { margin: 0 0 8pt; }
ul, ol { margin: 3pt 0 9pt 20pt; }
li { margin: 0 0 3pt; }
table { width: 100%; border-collapse: collapse; margin: 7pt 0 13pt; font-size: 9pt; page-break-inside: auto; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
th { background: #123650; color: white; text-align: left; padding: 6pt; border: 1pt solid #123650; }
td { vertical-align: top; padding: 5pt 6pt; border: 1pt solid #ccd7e0; }
tr:nth-child(even) td { background: #f3f7fa; }
strong { color: #102f47; }
code { font-family: Consolas, monospace; font-size: 9pt; background: #eef3f7; padding: 1pt 2pt; }
a { color: #0b3cc1; }
hr { border: 0; border-top: 1pt solid #ccd7e0; margin: 18pt 0; }
</style>
</head>
<body>
$body
</body>
</html>
"@

$tempHtml = Join-Path ([System.IO.Path]::GetTempPath()) ("rapidlink-content-models-{0}.html" -f [guid]::NewGuid())
[System.IO.File]::WriteAllText($tempHtml, $html, [System.Text.UTF8Encoding]::new($false))

$word = $null
$document = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $document = $word.Documents.Open($tempHtml)

    $section = $document.Sections.Item(1)
    $section.Headers.Item(1).Range.Text = 'RapidLink Website Content Models and Governance Specification'
    $section.Headers.Item(1).Range.Font.Name = 'Aptos'
    $section.Headers.Item(1).Range.Font.Size = 8
    $section.Headers.Item(1).Range.Font.Color = 7566195

    $footer = $section.Footers.Item(1).Range
    $footer.Text = 'Draft for management review  |  Caleb Adom Awuah  |  '
    $footer.Collapse(0)
    [void]$footer.Fields.Add($footer, -1, 'PAGE', $true)
    $section.Footers.Item(1).Range.Font.Name = 'Aptos'
    $section.Footers.Item(1).Range.Font.Size = 8
    $section.Footers.Item(1).Range.ParagraphFormat.Alignment = 2

    $wdFormatDocumentDefault = 16
    $document.SaveAs2($output, $wdFormatDocumentDefault)
}
finally {
    if ($document) { $document.Close($false) }
    if ($word) { $word.Quit() }
    Remove-Item -LiteralPath $tempHtml -Force -ErrorAction SilentlyContinue
    if ($document) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

Get-Item -LiteralPath $output | Select-Object FullName, Length, LastWriteTime
