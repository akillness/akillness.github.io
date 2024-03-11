import aspose.words as aw

# load document
doc = aw.Document("document.docx")

# set options
saveOptions = aw.saving.MarkdownSaveOptions()
saveOptions.images_folder = "Images" 

# save as markdown file
doc.save("document.md", saveOptions)