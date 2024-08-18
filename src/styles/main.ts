export default `
/* main.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: #f8f9fa;
  color: #212529;
  display: flex;
  flex-direction: column;
  align-items: center;
}

header {
  background-color: #343a40; /* Dark background similar to the example */
  color: white; /* White text for contrast */
  padding: 20px; /* Padding to space out the content */
  width: 100%; /* Full width */
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); /* Subtle shadow for depth */
}

header h1 {
  margin: 0;
  font-size: 1.8em; /* Adjusted font size to match the example */
  font-weight: bold;
}

header p {
  margin: 5px 0; /* Space between paragraphs */
  font-size: 0.9em; /* Smaller font size for descriptions */
}

.version {
  display: inline-block;
  background-color: #e7e7e7; /* Light gray background for version tag */
  color: #343a40; /* Dark text color */
  border-radius: 5px;
  padding: 2px 8px;
  margin-left: 10px;
  font-size: 0.85em; /* Smaller font size */
}

.base-path {
  margin-top: 10px;
  font-size: 0.9em;
}

header .brand{
  display: flex;
  align-items: center;
}
header .brand .logo {
  height: auto; 
  max-width: 50px;
}
header .brand .name {
}
.header-content{
  width: 100%;
  max-width: 1200px;
  margin: auto;
}
header .title-container {
  margin-top: 30px
}
header .base-url-container {
  margin-top: 30px
}


main {
  margin: 30px auto;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  width: 100%;
  max-width: 1200px;
}

.collapsible-main {
  padding: 0px 10px;
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  margin-top: 15px;
  font-size: 1.1em;
  font-weight: bold;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.clickable {
  cursor: pointer;
}

.collapsible-main:hover {
  background-color: #e2e6ea;
}

.collapsible-main .collection-name {
  margin-left: 5px;
}

.endpoints {
  display: block;
  padding-bottom: 10px
}

.collapsible {
  padding: 0px 5px;
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  margin-top: 5px;
  font-size: 1.1em;
  font-weight: bold;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.flex {
  display: flex;
  align-items: center;
}

.endpoint {
  padding: 5px;
  display: none;
}

.endpoint h3 {
  margin-bottom: 10px;
  font-size: 1.4em;
}

.http-method {
  padding: 5px 10px;
  border-radius: 3px;
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
  color: white;
  width: 80px;
  text-align: center;
  display: inline-block;
}

.get { background-color: #71c387; }
.post { background-color: #66a3ff; }
.put { background-color: #ffe066; }
.delete { background-color: #f58a94; }
.patch { background-color: #ffb366; }

.endpoint-path {
  margin-left: 10px;
  color: #454545;
  font-family: monospace;
  font-size: 16px;
}

.endpoint-summary {
  margin-left: 10px;
  font-size: 14px;
  font-weight: normal;
  color: #606060;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ptb-10 {
  padding:10px 0px;
}

.ptb-5 {
  padding:5px 0px;
}
`