/* @refresh reload */
import "./style.css";
import "mapbox-gl/dist/mapbox-gl.css";

import {
	getCoords,
	loadImage,
	getPersonGeoJSON,
	getSchoolsGeoJSON,
	getSchools,
	writeText,
} from "./functions";

import mb from "mapbox-gl";

mb.accessToken =
	"pk.eyJ1IjoidGF5bG9yd2ViayIsImEiOiJja2Iwc3AyMG4wYzYzMnJwZjNyNnByNGRoIn0.y-MaoCFcB-6CP1h3rgcSVA";

async function main() {
	const mapCont = document.querySelector<HTMLDivElement>("#app")!;
	const msgEl = document.querySelector<HTMLDivElement>("#msg")!;
	writeText("Getting coords", msgEl);
	const coords = await getCoords();
	const map = new mb.Map({
		container: mapCont,
		style: "mapbox://styles/mapbox/streets-v12",
		center: [coords.lon, coords.lat],
		zoom: 15,
	});
	// load and add images to map
	writeText("Loading images", msgEl);
	let personImg = await loadImage(map, "/person.png");
	map.addImage("personImg", personImg);
	let markerImg = await loadImage(map, "/marker.png");
	map.addImage("markerImg", markerImg);

	// get schools from json file
	writeText("Getting schools data", msgEl);
	const schools = await getSchools();

	// generate geoJSON data
	writeText("Parsing getJSON data", msgEl);
	const personGeoJSON = getPersonGeoJSON(coords);
	const schoolsGeoJSON = getSchoolsGeoJSON(schools);

	// add sources to map
	writeText("Adding sources", msgEl);
	map.addSource("person", personGeoJSON);
	map.addSource("schools", schoolsGeoJSON);

	// add layers to map
	writeText("Adding layers", msgEl);
	map.addLayer({
		id: "person",
		type: "symbol",
		source: "person",
		layout: {
			"text-field": ["get", "title"],
			"icon-image": "personImg",
			"icon-size": 1,
			"text-offset": [0, 1.25],
			"text-size": 10,
		},
	});
	map.addLayer({
		id: "schools",
		type: "symbol",
		source: "schools",
		layout: {
			"text-field": ["get", "title"],
			"icon-image": "markerImg",
			"icon-size": 1,
			"text-offset": [0, 3],
			"text-size": 10,
			"icon-allow-overlap": true,
			"text-allow-overlap": true,
			"icon-ignore-placement": true,
			"text-ignore-placement": true,
		},
	});

	// update person mark
	setInterval(async () => {
		writeText("Getting new coords", msgEl);
		const newCoords = await getCoords();
		const newPersonGeoJSON = getPersonGeoJSON(newCoords);
		// @ts-ignore
		map.getSource("person").setData(newPersonGeoJSON.data);
		writeText("Waiting...", msgEl);
	}, 5000);
}

(async () => {
	try {
		await main();
	} catch (err) {
		// @ts-ignore
		alert(err.message);
	}
})();
