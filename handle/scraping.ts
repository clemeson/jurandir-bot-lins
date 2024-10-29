import puppeteer from 'puppeteer';

interface Vaga {
    title: string;
    company: string;
    location: string;
    link: string;
}

export async function scrapeLinkedinVagas(searchTerm: string, pageLimit: number): Promise<Vaga[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const url = `https://www.linkedin.com/jobs/search?keywords=${searchTerm}&location=Brazil&f_WT=2`;
    console.log(`🔍 Acessando: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Rola a página para carregar mais vagas
    for (let i = 0; i < pageLimit; i++) {
        await page.keyboard.press('End');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Espera 3 segundos para carregar mais conteúdo
    }

    const vagas = await page.evaluate(() => {
        const jobCards = document.querySelectorAll('li div.base-card');

        return Array.from(jobCards).map(jobCard => {
            const titleElement = jobCard.querySelector('.base-search-card__title');
            const companyElement = jobCard.querySelector('.base-search-card__subtitle a');
            const locationElement = jobCard.querySelector('.job-search-card__location');
            const linkElement = jobCard.querySelector('a.base-card__full-link');

            return {
                title: titleElement?.textContent?.trim() || 'Título não disponível',
                company: companyElement?.textContent?.trim() || 'Empresa não disponível',
                location: locationElement?.textContent?.trim() || 'Localização não disponível',
                link: linkElement?.getAttribute('href') || '#',
            };
        });
    });

    await browser.close();
    console.log(`✅ Scraping finalizado! ${vagas.length} vagas encontradas.`);
    return vagas;
}
