import axios from 'axios';
import { getVirusTotalApiKey } from './awsSecrets.js';

export async function scanUrlWithVirusTotal(url: string) {
    const apiKey = await getVirusTotalApiKey();

    const response = await axios.post('https://www.virustotal.com/api/v3/urls', new URLSearchParams({ url }), {
        headers: {
            'x-apikey': apiKey,
            'content-type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data;
}
