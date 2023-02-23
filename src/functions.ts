import { GeoJSONSourceRaw, Map as MapBoxMap } from "mapbox-gl";
import { Coord, School } from "./types";

export async function getCoords(): Promise<Coord> {
	return new Promise<Coord>((res, rej) => {
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				res({ lat: pos.coords.latitude, lon: pos.coords.longitude });
			},
			rej,
			{ enableHighAccuracy: true },
		);
	});
}

export async function getSchools(): Promise<School[]> {
	const resp = await fetch("/colegios.json");
	return await resp.json();
}

export async function loadImage(
	map: MapBoxMap,
	url: string,
): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		map.loadImage(url, (err, img) => {
			if (err) reject(err);
			resolve(img as HTMLImageElement);
		});
	});
}

export function getPersonGeoJSON(coords: Coord): GeoJSONSourceRaw {
	return {
		type: "geojson",
		data: {
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [coords.lon, coords.lat],
					},
					properties: {
						title: "You",
					},
				},
			],
		},
	};
}

export function getSchoolsGeoJSON(schools: School[]): GeoJSONSourceRaw {
	return {
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
}

export function writeText(text: string, el: HTMLElement) {
	el.innerText = text;
}
