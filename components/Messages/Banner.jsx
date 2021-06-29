import React from 'react';
import { Segment, Grid, Image } from 'semantic-ui-react';

function Banner({ bannerData: { name, profilePicUrl } }) {
  return (
    <>
      <Segment color='teal' attached='top'>
        <Grid>
          <Grid.Column floated='left' width={14}>
            <h4>
              <Image avatar={profilePicUrl} />
              {name}
            </h4>
          </Grid.Column>
        </Grid>
      </Segment>
    </>
  );
}

export default Banner;
