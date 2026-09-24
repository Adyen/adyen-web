// @ts-check
const { config } = require('dotenv');
const { getCommitInfo, getPullRequestInfo } = require('@changesets/get-github-info');

config();

const repo = 'adyen/adyen-web';

const changelogFunctions = {
    getDependencyReleaseLine: async (changesets, dependenciesUpdated) => {
        if (dependenciesUpdated.length === 0) return '';

        const changesetLink = `- Updated dependencies [${(
            await Promise.all(
                changesets.map(async cs => {
                    if (cs.commit) {
                        const info = await getCommitInfo({
                            repo,
                            commit: cs.commit
                        });
                        return info?.commit.markdownLink;
                    }
                })
            )
        )
            .filter(_ => _)
            .join(', ')}]:`;

        const updatedDepenenciesList = dependenciesUpdated.map(dependency => `  - ${dependency.name}@${dependency.newVersion}`);

        return [changesetLink, ...updatedDepenenciesList].join('\n');
    },
    getReleaseLine: async changeset => {
        let prFromSummary;
        let commitFromSummary;

        const replacedChangelog = changeset.summary
            .replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
                let num = Number(pr);
                if (!isNaN(num)) prFromSummary = num;
                return '';
            })
            .replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
                commitFromSummary = commit;
                return '';
            })
            .trim();

        const [firstLine, ...futureLines] = replacedChangelog.split('\n').map(l => l.trimEnd());

        const links = await (async () => {
            if (prFromSummary !== undefined) {
                const info = await getPullRequestInfo({
                    repo,
                    pull: prFromSummary
                });
                let links = {
                    commit: info?.commit?.markdownLink ?? null,
                    pull: info?.pull.markdownLink ?? null
                };
                if (commitFromSummary) {
                    links = {
                        ...links,
                        commit: `[\`${commitFromSummary}\`](https://github.com/${repo}/commit/${commitFromSummary})`
                    };
                }
                return links;
            }
            const commitToFetchFrom = commitFromSummary || changeset.commit;
            if (commitToFetchFrom) {
                const info = await getCommitInfo({
                    repo,
                    commit: commitToFetchFrom
                });
                return {
                    commit: info?.commit.markdownLink ?? null,
                    pull: info?.pull?.markdownLink ?? null
                };
            }
            return {
                commit: null,
                pull: null
            };
        })();

        const prefix = [links.pull === null ? '' : ` (${links.pull})`].join('');

        return `\n\n- ${firstLine}${prefix ? `${prefix} \n` : ''}\n${futureLines.map(l => `  ${l}`).join('\n')}`;
    }
};

module.exports = changelogFunctions;
