import * as firebase from "firebase/app";
import "firebase/storage";
import shortid from "shortid";
import * as React from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import debug from "debug";
import "./image.css";

const log = debug("app:image");

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const storage = firebase.storage().ref();

export function ImageUpload({
  onRequestSave,
  onRequestClear,
  defaultFiles = []
}) {
  const [files, setFiles] = React.useState(defaultFiles);
  const ref = React.useRef(null);

  return (
    <FilePond
      files={files}
      ref={ref}
      labelIdle={`<span class="filepond--label-action"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24"><defs><path id="a" d="M24 24H0V0h24v24z"/></defs><clipPath id="b"><use xlink:href="#a" overflow="visible"/></clipPath><path clip-path="url(#b)" d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/></svg><span>Add an image</span></span>`}
      allowMultiple={false}
      maxFiles={1}
      server={{
        process: (
          _fieldName,
          file,
          _metadata,
          load,
          error,
          progress,
          _abort
        ) => {
          const id = shortid.generate();
          const task = storage.child("images/" + id).put(file, {
            contentType: "image/jpeg"
          });

          task.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            snap => {
              log("progress: %o", snap);
              progress(true, snap.bytesTransferred, snap.totalBytes);
            },
            err => {
              log("error: %o", err);
              error(err.message);
            },
            () => {
              log("DONE");
              load(id);
              onRequestSave(id);
            }
          );
        },
        load: (source, load, error, progress, abort) => {
          progress(true, 0, 1024);

          storage
            .child("images/" + source)
            .getDownloadURL()
            .then(url => {
              let xhr = new XMLHttpRequest();
              xhr.responseType = "blob";
              xhr.onload = function(event) {
                let blob = xhr.response;
                log("loaded URL: %s", url);
                load(blob);
              };
              xhr.open("GET", url);
              xhr.send();
            })
            .catch(err => {
              error(err.message);
              abort();
            });
        }
      }}
      onupdatefiles={fileItems => {
        if (fileItems.length === 0) {
          onRequestClear();
        }
        setFiles(fileItems.map(fileItem => fileItem.file));
      }}
    />
  );
}
