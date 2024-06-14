# ISCTE Schedule Management Application

## Project Overview

This project is developed as part of the Software Engineering course at Iscte - Instituto Universitário de Lisboa. The main goal of this application is to provide a robust tool for managing and navigating class schedules and room allocations at ISCTE. It aims to enhance the efficiency of schedule management through a user-friendly interface and automated features that adapt to user-specific requirements.

## Features

### Schedule Management
- **Load Schedules from CSV**: Users can load schedules from CSV files which include details such as course, class, enrolled students, day, start and end time, room requirements, and assigned rooms.
- **View and Navigate Schedule**: The application displays the schedule in a table format, allowing users to hide/show columns, sort, and filter the schedule based on various criteria.
- **Customizable Views**: Users can customize views using filters and logical operators (AND/OR).

### Room Catalog Management
- **Manage Room Information**: View and navigate through the detailed catalog of rooms including features such as type, capacity, and location.
- **Advanced Room Filtering**: Filter rooms by characteristics, availability over specific times, and combine these filters using logical operators.

### Editing and Saving Data
- **Direct Table Edits**: Users can edit the schedule directly within the app’s table view.
- **Save Changes**: Modified schedules can be saved in both CSV and JSON formats.

### Allocation Suggestions
- **Substitution Classes**: Suggest possible slots for substitution classes based on user-defined rules.
- **Class Allocation for Courses**: Propose slots for regular course classes, considering various constraints specified by the user.

### Conflict Analysis and Visualization
- **Analyze Class Conflicts**: Visual tools like network graph diagrams or chord diagrams to analyze and display conflicts between classes.
- **Room Occupation Map**: View a heatmap showing room occupation or availability, filtered by specific criteria.

## Technologies
- **Programming Environment**: ReactJS with Typescript framework and Tailwind as CSS framework
- **Version Control**: Git, with remote hosting on GitHub
- **Dependency Management**: npm or yarn
- **Testing**: JUnit or similar tools
- **Documentation**: JavaDoc or similar tools
- **Project Management**: Scrum approach managed via Trello integrated with GitHub

## Setup and Installation
1. Clone the repository:
git clone https://github.com/rafaelcoias/Excel_Management_System.git

3. Install the necessary dependencies:
npm i or yarn install

4. Run the application:
npm start or yarn start

## Authors and Acknowledgment
- Listed team members with their roles and contributions.
- Special thanks to faculty and collegues who contributed to the success of the project.
