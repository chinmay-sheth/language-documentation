const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const baseFilePath = "/Users/chinmay/Desktop/Scraping/python~3.6.html";
const baseUrl = "file://" + baseFilePath;

fs.readFile(baseFilePath, "utf8", async (err, data) => {
	if (err) {
		console.error(err);
		return;
	}

	const $ = cheerio.load(data);
	const links = $("a[href]")
		.map((i, el) => $(el).attr("href"))
		.get();

	const downloadFile = async (fileUrl, fileName, directory) => {
		const writer = fs.createWriteStream(path.join(directory, fileName));
		const response = await axios({
			url: fileUrl,
			method: "GET",
			responseType: "stream"
		});
		response.data.pipe(writer);
		return new Promise((resolve, reject) => {
			writer.on("finish", resolve);
			writer.on("error", reject);
		});
	};

	const retryDownload = async (
		fileUrl,
		fileName,
		directory,
		attempts = 1,
		delay = 1000
	) => {
		for (let i = 0; i < attempts; i++) {
			try {
				await downloadFile(fileUrl, fileName, directory);
				console.log(`Downloaded: ${fileName}`);
				return;
			} catch (error) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
		console.error(`Failed to download ${fileName} after ${attempts} attempts.`);
	};

	for (const link of links) {
		let fileUrl = "";
		try {
			if (link.includes(".html")) {
				let cleanedUrl = link.split("#")[0];
				fileUrl = cleanedUrl;
			} else {
				fileUrl = link + ".html";
			}
		} catch (e) {
			console.log(e);
		}

		const fileName = path.basename(fileUrl);
		const directory = path.dirname(fileUrl.replace(baseUrl, ""));
		if (!fs.existsSync(path.join(directory, fileName))) {
			if (!fs.existsSync(directory)) {
				fs.mkdirSync(directory, { recursive: true });
			}
			await retryDownload(fileUrl, fileName, directory);
		} else {
			console.log(`File already exists: ${fileName}`);
		}
	}
});
