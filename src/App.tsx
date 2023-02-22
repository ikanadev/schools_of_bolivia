import { onMount, Show, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import mapbox, { GeoJSONSourceRaw } from "mapbox-gl";

mapbox.accessToken =
	"pk.eyJ1IjoidGF5bG9yd2ViayIsImEiOiJja2Iwc3AyMG4wYzYzMnJwZjNyNnByNGRoIn0.y-MaoCFcB-6CP1h3rgcSVA";

interface Coord {
	lat: number;
	lon: number;
}
interface School {
	id: string;
	name: string;
	lat: string;
	lon: string;
}

const App = () => {
	const [map, setMap] = createSignal<mapbox.Map | null>(null);
	const [schools, setSchools] = createStore<School[]>([]);
	const [initialCoords, setInitialCoords] = createStore<Coord>({
		lat: 0,
		lon: 0,
	});
	const [myCoords, setMyCoords] = createStore<Coord>({
		lat: 0,
		lon: 0,
	});
	let mapCont: HTMLDivElement | undefined;
	// let map: mapbox.Map;

	onMount(() => {
		fetch("/colegios.json").then((res) => {
			res.json().then((data) => setSchools(data));
		});
	});
	onMount(() => {
		navigator.geolocation.watchPosition((pos) => {
			console.log("Watching position");
			if (initialCoords.lat === 0 && initialCoords.lon === 0) {
				console.log("setting initial cooord");
				setInitialCoords({
					lat: pos.coords.latitude,
					lon: pos.coords.longitude,
				});
			}
			setMyCoords({
				lat: pos.coords.latitude,
				lon: pos.coords.longitude,
			});
		}, (err) => alert(err.message));
	});

	createEffect(() => {
		console.log(
			"Setting mapbox effect: ",
			mapCont,
			initialCoords.lat,
			initialCoords.lon,
		);
		if (!mapCont || initialCoords.lat === 0 || initialCoords.lon === 0) return;
		console.log("Setting mapbox");
		const mapboxMap = new mapbox.Map({
			container: mapCont,
			style: "mapbox://styles/mapbox/streets-v12",
			center: [initialCoords.lon, initialCoords.lat],
			zoom: 14,
		});
		setMap(mapboxMap);
		map()!.loadImage("/person.png", (err, image) => {
			if (err) {
				console.log("err loading img: ", err);
				return;
			}
			// @ts-ignore
			map()!.addImage("me_img", image);
		});
	});

	createEffect(() => {
		if (!map() || schools.length === 0) return;
		map()!.loadImage("/marker.png", (err, image) => {
			if (err) {
				console.log("err loading img: ", err);
				return;
			}
			// @ts-ignore
			map()!.addImage("marker_img", image);
			const geoSource: GeoJSONSourceRaw = {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: schools.map((school) => ({
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates: [parseFloat(school.lon), parseFloat(school.lat)],
						},
						properties: {
							title: school.name,
						},
					})),
				},
			};
			if (!map()?.getSource("schools")) {
				map()!.addSource("schools", geoSource);
				map()!.addLayer({
					id: "schoolsLayer",
					type: "symbol",
					source: "schools",
					layout: {
						"icon-image": "marker_img",
						// get the title name from the source's "title" property
						"text-field": ["get", "title"],
						"text-offset": [0, 2],
						"text-anchor": "top",
						"text-size": 10,
					},
				});
			}
		});
	});

	createEffect(() => {
		console.log(
			"Setting up my coords",
			map(),
			myCoords.lat,
			myCoords.lon,
			map()?.hasImage("me_img"),
		);
		if (
			!map() ||
			myCoords.lat === 0 ||
			myCoords.lon === 0 ||
			!map()!.hasImage("me_img")
		)
			return;
		console.log("Setting up my coords");
		const geoSource: GeoJSONSourceRaw = {
			type: "geojson",
			data: {
				type: "FeatureCollection",
				features: [
					{
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates: [myCoords.lon, myCoords.lat],
						},
						properties: {
							title: "You",
						},
					},
				],
			},
		};
		if (!map()!.getSource("me")) {
			console.log("setting my coord", myCoords);
			map()!.addSource("me", geoSource);
			map()!.addLayer({
				id: "meLayer",
				type: "symbol",
				source: "me",
				layout: {
					"icon-image": "me_img",
					// get the title name from the source's "title" property
					"text-field": ["get", "title"],
					"text-offset": [0, 1.25],
					"text-anchor": "top",
				},
			});
		} else {
			console.log("updating my coord", myCoords);
			// @ts-ignore
			map()!.getSource("me").setData(geoSource);
		}
	});

	return (
		<Show
			when={initialCoords.lat !== 0 && initialCoords.lon !== 0}
			fallback={<p>Obteniendo coordenadas...</p>}
		>
			<div ref={mapCont} style={{ width: "100vw", height: "200vh" }} />
		</Show>
	);
};

export default App;
