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
  background-color: #343a40;
  color: white;
  padding: 20px 0px;
  text-align: center;
  width: 100%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

header h1 {
  margin: 0;
  font-size: 2.2em;
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
  width: 60px;
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