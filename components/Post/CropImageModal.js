import React, { useState, useEffect } from 'react';
import { Modal, Header, Button, Grid, Icon } from 'semantic-ui-react';
import Cropper from 'react-cropper';

function CropImageModal({ mediaPreview, setMedia, showModal, setShowModal }) {
  const [cropper, setCropper] = useState();
  return (
    <>
      <Modal
        closeOnDimmerClick={false}
        size='large'
        onClose={() => setShowModal(false)}
        open={showModal}
      >
        <Modal.Header content='Crop Image' />

        <Grid columns={2}>
          <Grid.Column>
            <Modal.Content image>
              <Cropper
                style={{ height: '400px', width: '100%' }}
                cropBoxResizable
                zoomable
                highlight
                responsive
                guides
                dragMode='move'
                initialAspectRatio={1}
                preview='.img-preview'
                src={mediaPreview}
                viewMode={1}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={false}
                autoCropArea={1}
                checkOrientation={false}
                onInitialized={(cropper) => setCropper(cropper)}
              />
            </Modal.Content>
          </Grid.Column>
          <Grid.Column>
            <Modal.Content image>
              <div>
                <Header as='h2'>
                  <Icon name='file image outline' />
                  <Header.Content content='Final' />
                </Header>

                <div>
                  <div
                    style={{
                      width: '100%',
                      height: '300px',
                      display: 'inline-block',
                      padding: '10px',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                    }}
                    className='img-preview'
                  />
                </div>
              </div>
            </Modal.Content>
          </Grid.Column>
        </Grid>

        <Modal.Actions>
          <Button title='Reset (R)' icon='redo' circular />
          <Button title='Move Canvas (M)' icon='move' circular />
          <Button title='New Cropbox (C)' icon='crop' circular />
          <Button title='Cancel' icon='cacnel' />
          <Button title='Crop Image' icon='checkmark' positive />
        </Modal.Actions>
      </Modal>
    </>
  );
}

export default CropImageModal;
