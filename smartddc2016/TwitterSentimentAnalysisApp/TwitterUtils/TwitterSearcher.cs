using LinqToTwitter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace TwitterUtils
{
    public class TwitterSearcher
    {
        private static TwitterContext Context = null;

        private async Task InitializeTwitterContextAsync()
        {
            var auth = new ApplicationOnlyAuthorizer
            {
                CredentialStore = new SingleUserInMemoryCredentialStore
                {
                    ConsumerKey = "wamG84e3GpkPjVp08UwsfAZIG",
                    ConsumerSecret = "9lCkCpXJ2FJFINs7329p06alOowqvWNJ2wwFPSTP9MaNu1xGyL"
                }
            };

            await auth.AuthorizeAsync().ConfigureAwait(false);
            Context = new TwitterContext(auth);
        }

        public async Task<IEnumerable<string>> GetTweetsAsync(string searchQuery, int limit)
        {
            var windowInMinutes = 15;
            var requestsLimitInWindow = 450;
            var tweetsReceived = 0;
            var numberOfRequests = 0;
            var startTime = DateTime.Now;
            var result = new List<string>();

            if (Context == null)
            {
                await InitializeTwitterContextAsync();
            }

            while (tweetsReceived < limit)
            {
                if (numberOfRequests < requestsLimitInWindow)
                {
                    try
                    {
                        ulong maxId = ulong.MinValue;
                        var searchResponse = await Context.Search.Where(
                            s => s.Type == SearchType.Search
                                    && s.Count == 100
                                    && s.SearchLanguage == "en"
                                    && s.MaxID == maxId
                                    && s.Query == searchQuery).SingleOrDefaultAsync().ConfigureAwait(false);

                        numberOfRequests++;
                        if (searchResponse != null && searchResponse.Statuses != null)
                        {
                            if (searchResponse.SearchMetaData == null || searchResponse.SearchMetaData.NextResults == null)
                            {
                                var nextMaxId = searchResponse.SearchMetaData.NextResults.Split(new string[] { "max_id=" }, StringSplitOptions.RemoveEmptyEntries)[1].Split('&')[0];
                                maxId = Convert.ToUInt64(nextMaxId);
                            }

                            var tweets = searchResponse.Statuses.Select(t => t.Text);
                            tweetsReceived += tweets.Count();
                            result.AddRange(tweets);
                        }
                    }
                    catch (Exception e)
                    {
                        if (e.InnerException != null && e.InnerException.Message.Contains("Rate limit exceeded"))
                        {
                            numberOfRequests = requestsLimitInWindow;
                        }
                        else
                        {
                            // Swallow exception and continue
                            //throw;
                        }
                    }
                }
                else
                {
                    // Wait 15 minutes and reset requests limits
                    var minutesToWait = windowInMinutes - (DateTime.Now - startTime).Minutes;

                    Console.WriteLine("Made {0} requests. Stopping for {1} minutes", numberOfRequests, minutesToWait);
                    Task.Delay(TimeSpan.FromMinutes(minutesToWait)).Wait();
                    numberOfRequests = 0;
                    startTime = DateTime.Now;
                }
            }

            return result;
        }
    }
}
