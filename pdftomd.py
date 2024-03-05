import aspose.words as aw

# Load PDF file
doc = aw.Document("jy_/assets/img/resume/resume.pdf")

# Save PDF as markdown
doc.save("/assets/img/resume/resume.md")