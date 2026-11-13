param(
    [string]$SourcePath = (Join-Path $PSScriptRoot '..\docs\RapidLink - CMS Management Summary.html'),
    [string]$OutputPath = (Join-Path $PSScriptRoot '..\docs\RapidLink - CMS Management Summary.docx')
)

$ErrorActionPreference = 'Stop'
$source = (Resolve-Path -LiteralPath $SourcePath).Path
$output = [System.IO.Path]::GetFullPath($OutputPath)
$word = $null
$document = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $document = $word.Documents.Open($source, $false, $true)
    $document.PageSetup.PaperSize = 7
    $document.PageSetup.TopMargin = 54
    $document.PageSetup.BottomMargin = 54
    $document.PageSetup.LeftMargin = 48
    $document.PageSetup.RightMargin = 48
    foreach ($table in $document.Tables) {
        $table.TopPadding = 3
        $table.BottomPadding = 3
        $table.Rows.HeightRule = 0
        $table.Range.Font.Size = 9
        $table.Range.ParagraphFormat.SpaceBefore = 0
        $table.Range.ParagraphFormat.SpaceAfter = 2
    }
    foreach ($paragraph in $document.Paragraphs) {
        if ($paragraph.Range.Text.Trim() -in @('Pricing and operational responsibility', 'Personal tests and decision gates')) {
            $paragraph.Format.PageBreakBefore = -1
        }
    }
    $document.Repaginate()
    $pages = $document.ComputeStatistics(2)
    if ($pages -gt 3) {
        $document.Content.Font.Size = 9.5
        $document.Content.ParagraphFormat.SpaceAfter = 5
        $document.Repaginate()
        $pages = $document.ComputeStatistics(2)
    }
    $document.SaveAs2($output, 16)
    $checkPdf = Join-Path $PSScriptRoot '..\.prerender\cms-summary-word-check.pdf'
    $document.ExportAsFixedFormat([System.IO.Path]::GetFullPath($checkPdf), 17)
    Write-Output "Created $output"
    Write-Output "Word page count: $pages"
}
finally {
    if ($document) { $document.Close($false) }
    if ($word) { $word.Quit() }
    if ($document) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
    if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
