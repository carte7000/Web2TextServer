var config = {
	GCM_API_KEY: process.env.GCM_API_KEY,
	FIREBASE_URL: process.env.FIREBASE_URL,
	FIREBASE_SECRET: process.env.FIREBASE_SECRET
}

console.log("Config file loaded successfuly");

module.exports = config;