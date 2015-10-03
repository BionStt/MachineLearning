using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using TwitterUtils;

namespace TwitterSentimentAnalysisApp.Controllers
{
    [RoutePrefix("api/sentiment")]
    public class TwitterSentimentAnalysisController : ApiController
    {
        // POST api/sentiment/predict
        [Route("predict")]
        [HttpPost]
        public async Task<string> PredictTweet(PredictTweetModel model)
        {
            var result = await this.PredictTweetsAsync(new List<string> { model.Tweet });
            return result;
        }

        // POST api/sentiment/study
        [Route("study")]
        [HttpPost]
        public async Task<string> StudyTermAsync(StudyTermModel model)
        {
            // Get tweets of the term
            var twitterSearcher = new TwitterSearcher();
            var tweets = await twitterSearcher.GetTweetsAsync(model.Term, 100).ConfigureAwait(false);

            // Analyze Tweets
            var result = await this.PredictTweetsAsync(tweets);

            return result;
        }

        // POST api/sentiment/compare
        [Route("compare")]
        [HttpPost]
        public string CompareTerms(CompareTermsModel model)
        {
            return "value";
        }

        private async Task<string> PredictTweetsAsync(IEnumerable<string> tweets)
        {
            using (var client = new HttpClient())
            {
                var values = tweets.Select(t => new string[] {"0", t }).ToArray();

                var scoreRequest = new
                {
                    Inputs = new Dictionary<string, StringTable>() 
                    {
                        { "input1",  new StringTable { ColumnNames = new string[] {"sentiment_label", "tweet_text"}, Values = values } }
                    },
                    GlobalParameters = new Dictionary<string, string>() { }
                };

                const string apiKey = "8ffKLuBmU1UPp0QClqTTmUbaxbLGZqitJMGvxwBw6xr/3UAHB/Cmh+Druo6BAuyFt0KfF/0YF4Huqw82L6kgkg==";
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                client.BaseAddress = new Uri("https://ussouthcentral.services.azureml.net/workspaces/206c1d97815f414caa21cd657c1f3119/services/3d3a0b4d5af34e5a91d0b0f250754d10/execute?api-version=2.0&details=true");

                var response = await client.PostAsJsonAsync("", scoreRequest).ConfigureAwait(false);
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                return result;
            }
        }
    }

    public class PredictTweetModel
    {
        public string Tweet { get; set; }
    }

    public class StudyTermModel
    {
        public string Term { get; set; }
    }

    public class CompareTermsModel
    {
        public string Term1 { get; set; }
        public string Term2 { get; set; }
    }

    public class StringTable
    {
        public string[] ColumnNames { get; set; }
        public string[][] Values { get; set; }
    }
}
