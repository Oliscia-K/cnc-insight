This project includes a Docker Compose service that runs Postgres and initializes a `files` table used by the upload API.

SETUP INSTRUCTIONS:

- GETTING THE CODE ON YOUR COMPUTER
1. Download Visual Studio Code
2. Sign into github account through the small person icon in the bottom-left corner of VS Code
3. Go to browers, sign into github, and navigate to the cnc-insight repository to clone the code into VS Code
4. Install Node.js and run "npm install" into the terminal 

- API SETUP
1. Download R and R Studio
2. Within R Studio, create two files with the names server.R and my_api.R. Within this repository are the same files as .txt. Copy the contents into the correct file
3. At this point, a notice will appear regarding packages to install. Install them. 
4. In the my_api.R file, click the "Run API" button near the top of the screen. This has to be running in the background for the application to work. 
5. A Swagger page will appear. Note the server value (Something along the lines of "http://127.0.0.1:19306" which is what my code expects. Yours will be different)
6. Within VS Code, replace the instances of "http://127.0.0.1:19306" with your server value (app/api/plot and app/api/upload)

- DATABASE SETUP
1. Install and login to Docker
2. Return to Visual Stuido and run "npm run db:up" in the terminal (this step also always needs to be done) You can go back to docker and check the "containers" tab to verify. There should be one with the name "cnc-insight"

- START APPLICATION
1. Run "npm run dev" in the terminal"
2. View the application at the localhost link provided 
3. Parse some data
4. CODE EDIT HERE: 4. The location of where parsed data is saved needs to be updated for wherever it is located on your computer. The text file provided has the line parsed_data <- readRDS("/Users/olisciathornon/Documents/Design Studio/parsed_cache.rds") for the my_api.R file. Check your files for where parsed_cache.rds was stored. The original directory should be replaced with yours. (Should be within the same folder your my_api.R and server.R files live)
5. Save the updated my_api.R file. Press the red "stop" button in the console. Then press "reload API" which will open a black screen. Exit that, then you should see "Run API" again. Click it 
6. Your application should now be fully able to run as expected. 

- Ending Notes.
1. To close the database, so it is not running in the background when not in use, run "npm run db:down" in the terminal 
