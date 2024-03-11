import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';
import {Message} from "./constants/messages.js";



  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

    /**************************************************************************** */

  //! END @TODO1

  app.get("/filteredimage", async (req, res) => {
    try {
      const MAX_LENGTH_URL = 200;
      const imageExtension = ['jpg', 'jpeg', 'png', 'gif'];
      let {image_url} = req.query;
      if (!image_url) {
        throw new Error(Message.URL_REQUIRED);
      }
      if (image_url.length > MAX_LENGTH_URL) {
        throw new Error(Message.URL_LENGTH_EXCEEDED);
      }
      let filteredPath = await filterImageFromURL(image_url.toString());
      const extension = image_url.split('.').pop();
      if (!imageExtension.includes(extension)) {
        throw new Error(Message.NOT_FOUND_MIME);
      }
      res.status(200).sendFile(filteredPath.toString(), () => {
        deleteLocalFiles([filteredPath]);
      });
    } catch (error) {
      if (error.message.includes(Message.URL_REQUIRED) ||
          error.message.includes(Message.URL_LENGTH_EXCEEDED)
          ) {
        res.status(400).send({ message: error.message });
        return;
      }
      if (error.message.includes(Message.NOT_FOUND_MIME)) {
        res.status(400).send({ message: Message.INVALID_IMAGE_EXTENSION });
        return;
      }
      res.status(500).send({ message: Message.INTERNAL_SERVER_ERROR });
    }
  })
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
