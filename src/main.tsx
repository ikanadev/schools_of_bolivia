/* @refresh reload */
import { render } from "solid-js/web";
import "./style.css";
import "mapbox-gl/dist/mapbox-gl.css";

import App from "./App";

render(
	() => <App />,
	document.querySelector("#app")!, // eslint-disable-line
);
