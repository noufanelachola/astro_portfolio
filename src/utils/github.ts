import { graphql } from "@octokit/graphql";

export interface GithubContribution {
  date: string;
  count: number;
}

export async function getGithubContributions() {
  const token = import.meta.env.GITHUB_TOKEN;
  const username = import.meta.env.GITHUB_USERNAME;

  const client = graphql.defaults({
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

    const recentQuery = `
        query($login:String!) {
            user(login:$login) {
                contributionsCollection {
                    contributionCalendar {
                        weeks {
                            contributionDays {
                                date
                                contributionCount
                            }
                        }
                    }
                }
            }
        }
    `;

    const totalQuery = `
        query($login:String!, $from:DateTime!) {
            user(login:$login) {
                repositories{
                    totalCount
                }

                contributionsCollection(from:$from) {
                    contributionCalendar {
                        totalContributions
                    }
                }
            }
        }
    `;

    const recentResult: any = await client(recentQuery, {
        login: username,
    });

    const totalResult: any = await client(totalQuery, {
        login: username,
        from: "2023-08-15T00:00:00Z",
    });

    console.log(totalResult.user.repositories);

    const days =
        recentResult.user.contributionsCollection.contributionCalendar.weeks.flatMap(
            (week: any) =>
                week.contributionDays.map((day: any) => ({
                date: day.date,
                count: day.contributionCount,
            }))
        );

    return {
        recent: days,
        totalContributions: totalResult.user.contributionsCollection.contributionCalendar.totalContributions,
        repositories: totalResult.user.repositories.totalCount,
    };
}