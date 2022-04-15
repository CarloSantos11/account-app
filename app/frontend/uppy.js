// app/javascripts/uppy.js

const Uppy = require("@uppy/core")
const Dashboard = require("@uppy/dashboard")
const XHRUpload = require("@uppy/xhr-upload")
const GoogleDrive = require("@uppy/google-drive")

const input = document.querySelector("input[type=file]")
const form = document.querySelector("form")
const csrfToken = document.querySelector('meta[name="csrf-token"]').content
const uppyTrigger = "#js-uppy-upload"
const uppyTriggerElement = document.querySelector(uppyTrigger)

const startUppy = () => {
  const uppy = Uppy({
    debug: true,
    restrictions: {
      allowedFileTypes: ['image/*', '.jpg', '.jpeg', '.png', '.gif']
    },
  })
    .use(Dashboard, { trigger: uppyTrigger })
    .use(GoogleDrive, {
      target: Dashboard,
      serverUrl: process.env.UPPY_COMPANION_SERVER_URL || "http://localhost:3020"
    })
    .use(XHRUpload, {
      endpoint: `${process.env.APPLICATION_URL}/uploader/image`,
      bundle: false,
      headers: { "X-CSRF-Token": csrfToken }
    })

  uppy.on("upload-success", (file, body) => {
    uppy.setFileState(file.id, {
      xhr: Object.assign({}, file, {
        uploadURL: body["uploadURL"],
        signedId: body["signedId"]
      })
    })
  })

  uppy.on("complete", result => {
    result.successful.forEach(file => {
      insertImageSignedId(form, input, file.xhr.signedId)
    })
  })
}

const insertImageSignedId = (form, input, signed_id) => {
  const hiddenField = document.createElement("input")
  hiddenField.setAttribute("type", "hidden")
  hiddenField.setAttribute("value", signed_id)
  hiddenField.name = input.name
  form.appendChild(hiddenField)
}

if (uppyTriggerElement) {
  startUppy()
}