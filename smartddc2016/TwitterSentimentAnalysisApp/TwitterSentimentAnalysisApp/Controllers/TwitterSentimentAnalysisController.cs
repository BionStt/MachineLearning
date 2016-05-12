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
        public async Task<List<string>> CompareTerms(CompareTermsModel model)
        {
            // Get tweets of the term
            var twitterSearcher = new TwitterSearcher();
            var results = new List<string>();
            foreach (var term in model.Terms)
            {
                var result = await this.StudyTermAsync(new StudyTermModel { Term = term });
                results.Add(result);
            }

            return results;
        }

        private async Task<string> PredictTweetsAsync(IEnumerable<string> tweets)
        {
            using (var client = new HttpClient())
            {
                var values = tweets.Select(t => new string[] { t }).ToArray();

                var scoreRequest = new
                {

                    Inputs = new Dictionary<string, StringTable>() {
                        {
                            "input1",
                            new StringTable()
                            {
                                ColumnNames = new string[] {"tweet_text"},
                                Values = CreateRectangularArray(values)
                            }
                        },
                    },
                    GlobalParameters = new Dictionary<string, string>()
                    {
                    }
                };

                const string apiKey = "iLvYA40C+8i7YDRWPDx57Ile8sEdzt4r8PC+yHHaVpaKivfz79VPK6Sii3ysS97zUdahaPjc79FPjKo5u8gDDg==";
                //old
                //const string apiKey = "8ffKLuBmU1UPp0QClqTTmUbaxbLGZqitJMGvxwBw6xr/3UAHB/Cmh+Druo6BAuyFt0KfF/0YF4Huqw82L6kgkg==";
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                client.BaseAddress = new Uri("https://ussouthcentral.services.azureml.net/workspaces/43bc8761510e4719a965b8f551859d22/services/d5862be1ea9a419387545aeeddd21a61/execute?api-version=2.0&details=true");
                //old
                //client.BaseAddress = new Uri("https://ussouthcentral.services.azureml.net/workspaces/206c1d97815f414caa21cd657c1f3119/services/3d3a0b4d5af34e5a91d0b0f250754d10/execute?api-version=2.0&details=true");

                var response = await client.PostAsJsonAsync("", scoreRequest).ConfigureAwait(false);
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                return result;
            }
        }

        static T[,] CreateRectangularArray<T>(IList<T[]> arrays)
        {
            // TODO: Validation and special-casing for arrays.Count == 0
            int minorLength = arrays[0].Length;
            T[,] ret = new T[arrays.Count, minorLength];
            for (int i = 0; i < arrays.Count; i++)
            {
                var array = arrays[i];
                if (array.Length != minorLength)
                {
                    throw new ArgumentException
                        ("All arrays must be the same length");
                }
                for (int j = 0; j < minorLength; j++)
                {
                    ret[i, j] = array[j];
                }
            }
            return ret;
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
        public string[] Terms { get; set; }
    }

    public class StringTable
    {
        public string[] ColumnNames { get; set; }
        public string[,] Values { get; set; }
    }

}
