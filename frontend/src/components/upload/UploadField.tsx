import React from 'react';
import { FileDrop } from 'react-file-drop';
import { makeStyles } from '@material-ui/core/styles';
import { Button, CircularProgress } from '@material-ui/core';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useTranslate,
} from 'react-admin';
// own
import './Upload.css';

interface FileUploadI {
  onFileInputChange: (fileList : File[]) => void,
  preview? : boolean
  show?: boolean
}

const FileUpload : React.FC<FileUploadI> = (
  {
    onFileInputChange, preview = true, show = false,
  },
) => {
  const useStyles = makeStyles({
    root: {
      display: 'flex',
      justifyContent: 'Center',
    },
    upload: {
      minWidth: 275,
    },
    input: {
      display: 'none',
    },
    dropSection: {
      border: '1px solid black',
      width: 600,
      color: 'black',
      padding: 20,
    },
    button: {
      height: 35,
      minWidth: 80,
    },
  });
  const [uploadedFiles, setUploadedFiles] = React.useState<File []>();
  const [loading, setLoading] = React.useState(false);
  const classes = useStyles();
  const translate = useTranslate();

  const handleChange = (fileList: FileList | null) => {
    setLoading(true);
    const updateFiles = uploadedFiles ? [...uploadedFiles] : [];
    if (fileList && preview) {
      const updatedFilesConcat = updateFiles.concat(Array.from(fileList));
      setUploadedFiles(updatedFilesConcat);
      onFileInputChange(updatedFilesConcat);
    } else if (fileList && !preview) {
      setUploadedFiles(Array.from(fileList));
      onFileInputChange(Array.from(fileList));
    }
    setLoading(false);
  };

  const handleChangeInput = (e : React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const { files } = e.target;
    const updateFiles = uploadedFiles ? [...uploadedFiles] : [];
    if (files && preview) {
      const updatedFilesConcat = updateFiles.concat(Array.from(files));
      setUploadedFiles(updatedFilesConcat);
      onFileInputChange(updatedFilesConcat);
    } else if (files && !preview) {
      setUploadedFiles(Array.from(files));
      onFileInputChange(Array.from(files));
    }
    setLoading(false);
  };

  const handleRemove = (index : number) => {
    const updateFiles = uploadedFiles ? [...uploadedFiles] : [];
    if (updateFiles.length > 0) {
      updateFiles.splice(index, 1);
      setUploadedFiles(updateFiles);
      onFileInputChange(updateFiles);
    }
  };

  return (
    <>
      <div className={classes.root}>
        <div className={classes.upload}>
          <input
            onChange={handleChangeInput}
            className={classes.input}
            id="contained-button-file"
            multiple
            type="file"
          />
          <div className={classes.dropSection}>
            <FileDrop
              onDrop={(f) => { handleChange(f); }}
            >
              <label htmlFor="contained-button-file">
                <Button
                  className={classes.button}
                  variant="contained"
                  color="primary"
                  component="span"
                  size="medium"
                  disabled={show || loading}
                >
                  { !loading ? translate('resources.routes.masscalculation.upload') : <CircularProgress size={20} />}
                </Button>
              </label>
            </FileDrop>
          </div>

          <input className={classes.input} id="icon-button-file" type="file" />

        </div>

      </div>
      <div className={classes.root}>
        <List style={{ marginTop: '1em' }}>
          { preview && uploadedFiles && Array.from(uploadedFiles).map((obj, index) => (
            <ListItem
              key={obj.lastModified}
              style={{ width: 600 }}
              secondaryAction={(
                <IconButton edge="end" aria-label="delete" onClick={() => { handleRemove(index); }}>
                  <DeleteIcon />
                </IconButton>
            )}
            >

              <ListItemText
                primary={obj.name}
              />
            </ListItem>
          ))}

        </List>

      </div>

    </>

  );
};

export default FileUpload;
