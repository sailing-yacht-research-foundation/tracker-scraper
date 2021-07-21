const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingUrls,
    registerFailedUrl,
} = require('../utils/raw-data-server-utils');

(async () => {
    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }
    const SOURCE = 'kattack';
    const FEED_LIMIT = 2000;
    // These are new races and feedIds only.
    const raceIds = {};
    const feedIds = {};

    // TODO: add non english characters to alphabet array.
    const SEARCH_REQUEST_DATA_STRING =
        '__EVENTTARGET=TextBox_Search&__EVENTARGUMENT=&__LASTFOCUS=&__VIEWSTATE=%2FwEPDwUJNzI2Mzg4OTc5D2QWAgIDD2QWBgIDDw8WAh4HVmlzaWJsZWhkZAILDxAPFgIeB0NoZWNrZWRoZGRkZAINDzwrABEDAA8WBB4LXyFEYXRhQm91bmRnHgtfIUl0ZW1Db3VudAKSAWQBEBYAFgAWAAwUKwAAFgJmD2QWpgICAQ9kFgJmD2QWAgIBDw8WBB4LTmF2aWdhdGVVcmwFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD05NWI0N2I3Zi03NWFiLTRkOGYtYjJkNS00Yjg2YzcyYWFiMGMeBFRleHQFCkoxMDUgQ2xhc3NkZAICD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD0wOGZmYzEyMS1mMDYzLTRkYjctYWM1Ny1mYTEwYzQ0NjM5MjkfBQUSU3RvbnkgQnJvb2sgU2Nob29sZGQCAw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9NjQyN2Q4ZjQtNTM3OS00YmQ4LTg0OWUtYzE1NWI4NmVjZTc1HwUFEkVhc3Rlcm4gWWFjaHQgQ2x1YmRkAgQPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWYzNWY5YTJmLTgyYjgtNGExZi1iOWNlLWM1Nzg0OGIyY2YwNx8FBRlTYXJhc290YSBTYWlsaW5nIFNxdWFkcm9uZGQCBQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9YzFhZTFmZWEtYTI3NC00MWQzLTk1NjUtOGM0NTU1YzNjNTQ1HwUFEk9rb2JvamkgWWFjaHQgQ2x1YmRkAgYPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWJiYTFmZjlhLThiYTgtNDU1Yi05YTgzLTkxMDQ5Y2IyODkzYh8FBR5Db3JpbnRoaWFuIFlhY2h0IENsdWIgQ2FwZSBNYXlkZAIHD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD03OGQzODNmYS1lODEzLTRiZjAtYjFkZS1hYmFhMTA0MjI1MjYfBQUWV2lzY29uc2luIFNhaWxpbmcgVGVhbWRkAggPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTNmOGM1MzkxLWZlOWYtNDc2Yi04YTQ4LWJmYzhiMWY1MDFlNh8FBRRBbm5hcG9saXMgWWFjaHQgQ2x1YmRkAgkPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTVjYTMxYTRjLTU3MWUtNDRkZS1iNjRmLTBlNjAxNjU2NzM4Mx8FBQNGMThkZAIKD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD04MjhjZjM4ZC1iMWRiLTRiNTAtOWIwNy1jZmFjNGNkYTIzYzEfBQUSV2F5emF0YSBZYWNodCBDbHViZGQCCw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MGRiN2QxN2MtY2M2Ni00OGJiLTgyMzAtNjhjZjUwN2U1Yjg5HwUFFE5hbnR1Y2tldCBZYWNodCBDbHViZGQCDA9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9YzVmMjE0NTAtOGU0OS00Mjk4LWFiMjgtM2M1YWVjMGYyNTFjHwUFEkNoZXN0ZXIgWWFjaHQgQ2x1YmRkAg0PZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTUxYjI1MmZkLTA1OTAtNDE5MC1iNDFmLTNhYTQwNjQ0NTgxNh8FBQVPWUNTU2RkAg4PZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPThkZjQzYzZjLTI5OGYtNGI5NS04Yzg2LTM0ZDI2ZjE2N2IwOB8FBQpEZW1vIFJhY2VzZGQCDw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MmY2NTM4ZmItMWI4YS00ZGQ3LWExM2EtNDlkMDRkZjQyNzE3HwUFEkphY2tzb24gWWFjaHQgQ2x1YmRkAhAPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTgyNjk0MTMzLTkzZDAtNDU1OS04ODZiLWI0NzdmNzFiNTNmNx8FBRlTb3V0aCBDYXJvbGluYSBZYWNodCBDbHViZGQCEQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9NGM1MWY4OGItY2JiMy00NzcyLTk4NmUtNGFiZjM1NThmZWRiHwUFFU1pbm5ldG9ua2EgWWFjaHQgQ2x1YmRkAhIPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTNkMDRkMmY3LTZkOTItNDY5OC04NDEzLTY0ZDQ3NGY2MzRhOB8FBRZNaXNzaW9uIEJheSBZYWNodCBDbHViZGQCEw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9YWYzZDRjZTktYzM3NS00Nzc4LThhYmUtMzY5Yjk0YjJjNGEzHwUFKFBhY2lmaWMgU2luZ2xlaGFuZGVkIFNhaWxpbmcgQXNzb2NpYXRpb25kZAIUD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD0zMzI5NDVkMS03OTYxLTRjNzEtODJmMy1mMDA2NDNjZDAwNTYfBQUWU2FpbCBTZXJpZXMgUHJvbW90aW9uc2RkAhUPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWY3MjRkODZkLTBlYjQtNDdkZS1hZGJkLTI0MzBhNGViMTMyNx8FBQdMTyBKMTA1ZGQCFg9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9ZDY0NmMyYjctMzZlNi00YjkxLTgyZGMtZWRiMjMyMzQwZDljHwUFJU5ldyBZb3JrIEFyY2hpdGVjdHMgUmVnYXR0YSBDaGFsbGVuZ2VkZAIXD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1mYzhlZTY4ZC02MDQxLTRiYzEtYjVmNy1iZGVkNDlkMjcxMDAfBQUTTmV3IFlvcmsgWWFjaHQgQ2x1YmRkAhgPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTNhYzMyZWIzLThkNjUtNDIwNS1iM2U5LWUxMDgyMWFjMWUxMB8FBRpOWU7DhFNIQU1OUyBTRUdFTFPDhExMU0tBUGRkAhkPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTQ3NzA3MGQ0LTA3NjgtNGZhNS1iMGVjLWQzNjk5MzQ1NTBmNB8FBRJNZW5kb3RhIFlhY2h0IENsdWJkZAIaD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD03MjRiOGYzZC0zMTIxLTRmOGEtYmY3Mi00MDMzMjU0MzJjMGIfBQUMRW5zaWduIENsYXNzZGQCGw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9OTI3MzY5YzUtYjEzNy00ZjJjLThjNDUtNDNjMjQ0MDU1ZmI0HwUFBllSQUxJU2RkAhwPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWEwYjZlMDYzLWQxZGItNDQ3Ny1iMmIyLTNjNjVlNGU4ZmZmNh8FBRJCdWZmYWxvIENhbm9lIENsdWJkZAIdD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1iZDA2MDRmNS1kNmMyLTRmZjQtYjZhMi1lMTdmZmZlZWU5NzQfBQUZQ2VkYXIgTGFrZSBTYWlsaW5nIFNjaG9vbGRkAh4PZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTlmNTBmNDY3LTliN2MtNDJlNC1iMTMxLWUzNDgxOWNjOWZjNB8FBRNTb3V0aGVybiBZYWNodCBDbHViZGQCHw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9YjEwMGM4MDEtN2M5NS00MmM1LWI3YWMtZDY2MjNjNjMwYjU2HwUFFVJ1c2ggQ3JlZWsgWWFjaHQgQ2x1YmRkAiAPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTgwZWY4NGJjLWZlMzUtNDAzMi1iNmM1LWM4ZTM4ZjQ5YjQzZB8FBQhBdGxhbnRpY2RkAiEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTIyODcyOGRjLWY5NmUtNDZhMC1hNjQyLWNjZGU4NTE5YmY3OR8FBRNCb25lIElzbGFuZCBSZWdhdHRhZGQCIg9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9OGE3ZDA4NDYtNGUyMS00NTBkLWFlMmUtMWIxYzFkMmI0NzAyHwUFHVNhbmR5IEhvb2sgQmF5IENhdGFtYXJhbiBDbHViZGQCIw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9YjU2YWI5ZDQtYjlkZS00ZDU2LTg1MWItZjFkNjM3NjZlNzg5HwUFFEZvcnQgV29ydGggQm9hdCBDbHViZGQCJA9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MTZhM2FmOGQtZGFmZS00MzEyLTgzNjEtMTExNzc1ZjE3Y2EzHwUFFUxvbmcgQmVhY2ggWWFjaHQgQ2x1YmRkAiUPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTI2NzY5NjhkLWY0NGUtNGQ1Yi1iODE2LTQ3YzFhYzk0YmY3OR8FBQRTT1JDZGQCJg9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9Nzg1MGYyMDAtMGRiMS00YjExLTk2ZGEtMGE2MTBmNTVlZDEwHwUFGE1vbnRlcmV5IEJheSBZYWNodCBDbHVic2RkAicPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWJkZDdmZmZkLTg5YzItNGY1Ny05YjA3LTVkZDQ5MDZiOGExYx8FBRdEYXZpcyBJc2xhbmQgWWFjaHQgQ2x1YmRkAigPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTZkZDkzMjc0LTQ5YmItNDc3My1hNDczLTMwNGY4NDUxMGI0OB8FBQVKRmVzdGRkAikPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTY1OWQ1Nzk2LWEzM2UtNGYxYi1iMWJkLWUyZGRlYjc1MWY4NB8FBSZUaGUgR3JlYXQgQ2hlc2FwZWFrZSBCYXkgU2Nob29uZXIgUmFjZWRkAioPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWFiZTZjMGMwLTE2MzEtNDYzZS04OTg5LWM2N2FlZDMyZGVlOR8FBSdFYXN0ZXJuIENvbm5lY3RpY3V0IFNhaWxpbmcgQXNzb2NpYXRpb25kZAIrD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1mMWFkMmI1My0yNjJhLTRlN2QtODI2My1lYjIxODdmNGMxNzMfBQUfTmF0aW9uYWwgUG93ZXIgQm9hdCBBc3NvY2lhdGlvbmRkAiwPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTNhYTZlZDNmLTQzNWEtNDNjYS04NzEwLThmNDY3OGRhNjU0MR8FBSdUaGUgR3JlYXQgUHJvdmluY2V0b3duIFNjaG9vbmVyIFJlZ2F0dGFkZAItD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD04MDZhYWYzZi0yOTVhLTRlMzgtODE0YS0xOGU4N2I1NWU4NTQfBQUTU3RhbWZvcmQgWWFjaHQgQ2x1YmRkAi4PZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWQ1ZGQ0YjViLTIxNGMtNGE4MC05YjllLWQ5ZWJkYzVkZDBiOR8FBQZCdWNrZXRkZAIvD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD0wNjAyY2Q1MC02MjBiLTRlOWYtYmIzOC00MmNkMjYzOTZiNDgfBQUVQ2xlYXIgTGFrZSBZYWNodCBDbHViZGQCMA9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9OWY3Nzg2NDYtNjRhYy00MTAwLWJhN2MtZjI0NTk1Y2IyMjM1HwUFEEFtZXJpY2FuIFJlZ2F0dGFkZAIxD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1hNTU4NGZiZi1jZTdjLTQwNjAtYTYzYy02MDRlM2U1YjE1ZjcfBQUXSWRhIExld2lzIERpc3RhbmNlIFJhY2VkZAIyD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD05YzdlZWNlMy0wOGI1LTRlN2QtODE3YS04ZGMwMjc1YTQ1OGEfBQUKVVMgU2FpbGluZ2RkAjMPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTIxMWMxYjJmLTNjNTctNGY4My1hNzdkLTlkMzI4M2I1ODJmNx8FBQdZbmdsaW5nZGQCNA9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9ZDE1MGRhYTItY2I2ZC00MmY2LWEyZDMtZmZlNzkxM2RhZjZjHwUFEFN0IE1hcnlzIENvbGxlZ2VkZAI1D2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1jNWVhOWEzMy03NWM1LTQ0OWMtYTQwMy05MzZjOGNjMzgzNWQfBQUaTGl0dGxlIFRyYXZlcnNlIFlhY2h0IENsdWJkZAI2D2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1jNWUxMmNkYS0xYzY3LTRmYzctYmE1OC1lYTZjODYzZWMwZjUfBQUNU3dhbiA0MiBDbGFzc2RkAjcPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWM3YTkwZDIwLTkxM2UtNGYzZi1iYjg4LThiOTk5MDBmYmU1Yh8FBQdNQyBTY293ZGQCOA9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9OWI1YWQwN2MtYzlhZi00OTJjLWEzODgtOTEzYzAxZTg4MjlkHwUFFVdoaXRlIEJlYXIgWWFjaHQgQ2x1YmRkAjkPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTBlMmM1YWJjLTQ1NmItNDA4Zi1iNWFhLWI1ZmQ4YTI3Zjg4NR8FBQhFdGNoZWxsc2RkAjoPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTllMzZmYWNlLWNkNTgtNDFjNi04YmQ3LTFkOGQ1ZTY5N2M0ZB8FBRRTYW4gRGllZ28gWWFjaHQgQ2x1YmRkAjsPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWFhNTcxZWJmLTFlN2EtNGU2OC05YmFhLWY5Y2E0NjBmZTU4Yx8FBRJHdWxmcG9ydCBDaGFsbGVuZ2VkZAI8D2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD01N2Y1YmQ5Yy1hNWViLTQ3ZjUtODc0Yy01MWE2ZjdlZDIzNjIfBQUOT3BlbiA1NzAgQ2xhc3NkZAI9D2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD03MjQzNWExOS01NGI5LTRmN2YtODhhOS0yZDU1MWYyY2NkZWMfBQUGQS1DYXRzZGQCPg9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9NjA5Y2ZmMWYtMTU2MC00OTNmLWE1ZTMtZjJhNTk4ZTM5OTQzHwUFA0oyNGRkAj8PZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTQ1MDY2NTNkLTUyNWUtNDI0ZC05ZDQwLTJlNmI0Y2MxYTNkMx8FBRdBbGFtaXRvcyBCYXkgWWFjaHQgQ2x1YmRkAkAPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTVkNmE1NDBhLTk1NzUtNDc4NS05NzE2LTNhNzhkOTRmM2RmNR8FBRRNYXJxdWV0dGUgWWFjaHQgQ2x1YmRkAkEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPThiZGYwZjAwLTViYjEtNDlkMy1hNjY0LWI1NGExNzlkMDI5Nh8FBRZTdC4gRnJhbmNpcyBZYWNodCBDbHViZGQCQg9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MTM0YTk3NTYtNGI0MS00ZWFhLTkyYjItYzZkMTAyYzk4NDg0HwUFFENsZXZlbGFuZCBZYWNodCBDbHViZGQCQw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9ZTlhNTQ1ZGItNWNlNy00NWJhLTgzOTUtMTExMGFkZThmMWJlHwUFA0NZQ2RkAkQPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTlmOGE3ZWI3LTNlZmYtNDA4Yi05ZjlkLTk2OWRmOWE0ZTg2ZB8FBRpMYWtlIEJldWxhaCBTYWlsaW5nIFNjaG9vbGRkAkUPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWZiOGVlYTkyLTAxZjUtNDI4Ni04MzlhLWMxNWQ5OTI4NWQ3YR8FBTBTb3V0aGVybiBDYWxpZm9ybmlhIE91dHJpZ2dlciBSYWNpbmcgQXNzb2NpYXRpb25kZAJGD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD00NzdmYTc3ZS1mYmNkLTQ4MGEtYjM1My1mZjE3NTE4ODE5NGYfBQUGRmlnYXdpZGQCRw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9ZTI1ZmQwYTktNDJmMS00NjNlLTk3YjAtN2JlYjI4NWY5Mzg1HwUFDVJlZ2F0YSBhbCBTb2xkZAJID2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD00ZTAwODliOC0zYWE0LTRlNDctYTQ5Yy02NWJjOTUzNmFmYWMfBQUZTmV3cG9ydCBIYXJib3IgWWFjaHQgQ2x1YmRkAkkPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWVjM2VlNDNkLTFhNWItNGU3ZS1hZDBhLTVmNmMzMDUxNTQwMh8FBRBEaXN0YW5jZSBNYXR0ZXJzZGQCSg9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9ZGZmZmNmOTctOTM5Yy00Nzc1LTk2NjItODE1MjFmYmViODE4HwUFFUNvbHVtYmlhIFNhaWxpbmcgQ2x1YmRkAksPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTQ4MjdkMGVhLTNlYzMtNGZlMi1hYTc3LTFiMGY3NzgxMmQ5MB8FBRBBbWVyaWNhbiBSZWdhdHRhZGQCTA9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9OTQ4MTAxZmItY2IxNy00ZDJkLTk3MjAtMzlmMmVhMWY2Yjg5HwUFD1dlc3QgQ29hc3QgMjllcmRkAk0PZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTBiM2Y2NGE0LTM3Y2UtNGVhZC1iNDlhLWJkMzNhNWM4ZmMwMx8FBRJMYWtlIFBvbnRjaGFydHJhaW5kZAJOD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD01M2ExOTdjNi1lMmRjLTQyN2ItODJkMi05MWRkNDdlMWJjMjIfBQUEQ1JBV2RkAk8PZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTlkNDFiYTEyLWY3NWQtNGZiMS1iMWY4LWQ0ODk3MmUyOTFhYh8FBRhTaGVib3lnYW4gU2FpbGluZyBDZW50ZXJkZAJQD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD02MzA1YmEzNy1hM2FhLTRkZjUtYjNiNy04ZmRkNWFhYjNmZmEfBQUHU0YgSjEyMGRkAlEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWNmMTg2YjA2LTk4MTgtNDYxNy05MzkzLTIzN2EyYThmZGQ3Mh8FBRNOYXRpb25hbCBZYWNodCBDbHViZGQCUg9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9YzE4MDQ2MDQtNzY1MC00Zjk4LThmYTItZjgzNjJjMmE4ZTNkHwUFC0NhbmFkYXMgQ3VwZGQCUw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9YTNkMDIwMTEtMTgzMi00NzdjLWJlOWMtY2Q0MjM0ZDBlODk0HwUFE1RleG9tYSBTYWlsaW5nIENsdWJkZAJUD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD04MDQ2ZmE5YS04MzkwLTQ2MzMtOGVkYi05OThiMDJiNjljZDIfBQUVTm9ydGggQ2FwZSBZYWNodCBDbHViZGQCVQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9NzVhODg0M2YtYzRhMS00YzIyLWFjYjUtMDU5YmVlYTNlOGQ3HwUFGlBlbnNhY29sYSBCZWFjaCBZYWNodCBDbHViZGQCVg9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9YTk5YzZjZDctNzkyZS00ZDA5LWJmODgtYTYxZTBiNWIyNzM2HwUFG0RlbGF2YW4gTGFrZSBTYWlsaW5nIFNjaG9vbGRkAlcPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTE0MTBkYTI0LTM5OGMtNDg1NC1iOTAyLTUwNGNjMjJiMGI0OR8FBRJUaGUgU3VwZXJ5YWNodCBDdXBkZAJYD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD02ZjY3MzA5Yy04M2VjLTQxZmUtOWVjNS03YWU5MWZkYzdmNzcfBQUMU2FpbCBOZXdwb3J0ZGQCWQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MzYwYWUyMjktM2Y5NC00ZjBmLTgwMDctODljMTg0NDRkNzlkHwUFFUlzbGFuZCBCYXkgWWFjaHQgQ2x1YmRkAloPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTY2NWVmOTcwLTQ2YTUtNGIxZC05Y2YzLWZlZTVjNWJhYzY4Nx8FBRFCYWxib2EgWWFjaHQgQ2x1YmRkAlsPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWI4NWE3ZWJhLTQyZWYtNDVjOS04NDE3LTk0NGI5YTcxMTIzMR8FBQ9IZWF2ZW4gQ2FuIFdhaXRkZAJcD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD0zZDBjN2M3Zi1lMDI3LTQ0MjktODRmMi02NmVkNTNjMzYyNTYfBQUURnJvc3RiaXRlIFlhY2h0IENsdWJkZAJdD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD0yYTFiZTM1My00MzNlLTQwNGYtODk5ZC01MGU3NTU2NmJhMGIfBQUESUNTQWRkAl4PZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWFjYmMwZGExLWY4NmUtNDJhNy04OGRhLTE5MWRlMmM5MjdhOR8FBRlDaGljYWdvIE1hdGNoIFJhY2UgQ2VudGVyZGQCXw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MThmZWY4MzgtZDE2YS00YTQwLWFhZWItN2NkYjUzNWQxMjQxHwUFEEF1c3RpbiBCb2F0IENsdWJkZAJgD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1iZDVjNWY3MC05MDMxLTRmYjUtYjFhMC03NDdkYzQ4NzM4ZGEfBQUVR29sZGVuIFllYXIgb2YgUmFjaW5nZGQCYQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MzY5NDZiNzEtMjM0NS00Y2I5LWE0NTctOWQ1NTE1ODVjYWEyHwUFFExvbmcgTGFrZSBZYWNodCBDbHViZGQCYg9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9ZTdmNjY3NzctZjA4Yy00MmRiLThlNzUtOWUyNjk4OWI0ODY0HwUFDllhY2h0IFRyYWNraW5nZGQCYw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9NTEzNmYyM2ItYmExYy00OWIxLWEwZTYtMmRlZTA2MGVkZjVjHwUFEkJ1ZmZhbG8gWWFjaHQgQ2x1YmRkAmQPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTQ0NmIyYWYwLTFiM2UtNGM3NS05MWM2LTU2ODE4MWY2ODRkOB8FBRJCYXl2aWV3IFlhY2h0IENsdWJkZAJlD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD04NTE1MTA1MC0xNDQwLTQ0YmMtYWY4MS1hYzBkZTAxMWM3YmIfBQUUQnV6emFyZHMgQmF5IFJlZ2F0dGFkZAJmD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD05YjdiYWZhZS1iYmYwLTQ4OTktYmRhMi05MWU3MWJjZmNmMjYfBQUWUG9ydCBDcmVkaXQgWWFjaHQgQ2x1YmRkAmcPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWJmZjA5Y2UzLWJlYWYtNGQwMi1hZDI2LWViZjhkNTY4YTk2Nh8FBRFTYWlsIE5ld3BvcnQgSiA4MGRkAmgPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTlkNGMwMTIxLTQxY2UtNDQ1Yy04ZmViLTM3NTZiOWMxOTFjNh8FBSBNeXN0aWMgUml2ZXIgU2FpbGluZyBBc3NvY2lhdGlvbmRkAmkPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWVkNzhmMTAyLTZkNWItNDBiNC1iNGFkLWJkNWRjNWY1YWRmNh8FBRNOZXBlYW4gU2FpbGluZyBDbHViZGQCag9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9YjNmOGU4YWMtMDA4ZC00ZTY4LWJhYjYtMWY5OTc0OGRhOGM4HwUFBENDWUNkZAJrD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD02MTM1OTNiMy0yMzlhLTRlYmMtYWE5NC02ZDIwYmM3NTRlMWEfBQUVU2VhdHRsZSBUaGlzdGxlIEZsZWV0ZGQCbA9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9NzY5NzVhNzQtZGFjNy00Njk5LWJiNGEtYTdkODU2MjAxNmJiHwUFB1NoaWVsZHNkZAJtD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD01MjU4ZmVmOS0wMzZkLTQ0ZWQtODRlMy02MTBhOGNmNDQ1MzAfBQUHVGVhbSBBUWRkAm4PZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWMwMmRlYzcxLTI4NTEtNDRlMS1iOGIyLTRmZGYzOTY4N2VkNh8FBQ1DYWwgUmFjZSBXZWVrZGQCbw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9NWJiNDhmMzAtY2JiYy00NWRiLTkxNDAtZTVkYzE3ZDI3ZjI1HwUFHDYxc3QgQW5udWFsIEhlaW5la2VuIFJlZ2F0dGFkZAJwD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD0xMDdmYjkwZC00NDFjLTRhZGMtYTJlMS03YzUxYzNlNDhmMTQfBQUpTWVsZ2VzIDI0IE5vcnRoIEVhc3QgRGlzdHJpY3QgQ2hhbXBpb3NoaXBkZAJxD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1mYzc0ZDgzZS1lNzQwLTQwYTMtYjI2Zi1kODg2YmZjMmQyYzQfBQUdTm9ydGggQW1lcmljYW4gU2FpbGluZyBDZW50ZXJkZAJyD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD01NTNmMzJlZC05MjRmLTQxODktYTcyNC0yYjdhMjc4OGNkNWYfBQUhRG9tZW5pY28gRGUgU29sZSAmIEFzc29jaWF0ZXMgQ3VwZGQCcw9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MTg3OTU0ZGYtZWM0YS00OWJlLWE0YTktNWVhZDY5ZGMyOGI1HwUFE0xha2V3b29kIFlhY2h0IENsdWJkZAJ0D2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1kMWEyMThiNS1lMGQyLTQwYWEtYjU1NS0wZDcyZDRmOGM3YzQfBQUOQW5uYXBvbGlzIE5PT0RkZAJ1D2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD0yNTMxZTJjMy0yZjhhLTRjMmItYTAzMC1jM2Y0OTVhMjU3OWUfBQUUQ2hhcmxlc3RvbiBSYWNlIFdlZWtkZAJ2D2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD03YWFiMjVjMS1jZjJmLTQ5NDktYmQ4OC0wN2U3YWY1YWMwNzYfBQUQT3BlbiBTYWlsaW5nIFVTQWRkAncPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTcwM2E0N2ExLWQ2YTYtNDI3MS1iZmYzLTcxODkxYmE3NGJkNx8FBQhLZXkgV2VzdGRkAngPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTM3MDYwMzQ1LTM4NTQtNGE0NS04MmVmLTRiYzk3MzllNjlhZB8FBRVMYXVkZXJkYWxlIFlhY2h0IENsdWJkZAJ5D2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD0wOThiOTIxZS01ZTQxLTRhMzMtODIyNi05Y2VhMGI3ZTc0ZmYfBQUKVVMgU2FpbGluZ2RkAnoPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTU1MjA2N2YwLWU5YmQtNDVjMy1iYTFiLWU0YWM1NGExNTE0Nh8FBRpHZW5ldmEgTGFrZSBTYWlsaW5nIFNjaG9vbGRkAnsPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTJlMTYxZmI3LTFiMmItNDE3Zi05M2NlLWVkNzk0NzBlODc3ZB8FBRNTYXl2aWxsZSBZYWNodCBDbHViZGQCfA9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9NjFkYmNkYjctZTM2YS00YWM2LTkwY2MtNjU2NWVmMzk5NGZjHwUFDEJsb2NrIElzbGFuZGRkAn0PZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTJhMzZiMWYwLWE4OGMtNGI2MS05ZjU4LWM2MWRiMzI1ZDQwYR8FBRtDZWRhciBQb2ludCBPbmUgRGVzaWduIDIwMDlkZAJ%2BD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1kNGZlZDZkMy04MmRiLTQyOTUtYjk3Ny0zNGEyYWQ0ZGU0MmYfBQUXQmlzY2F5bmUgQmF5IFlhY2h0IENsdWJkZAJ%2FD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1jNWYxYTM2YS01NjBhLTQ0ZWMtYTVjYS05OWE5Mjg0Njg4ZWUfBQUHSUROSVlSQWRkAoABD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1jZWY4ODQ3ZS0xYTIwLTRkZmEtODYzMS00YTFlNjUzYmQwYmUfBQURQ29udmV4aXR5IFNhaWxpbmdkZAKBAQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9ZWIzYTBhNjEtNWU5MS00ZDExLTg4ZmQtNjAxODczMTVhMjE3HwUFDjEyIE1ldHJlIENsYXNzZGQCggEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWRiZTZmMmNlLTdlMTMtNDUxYS1hODBkLWRmNDVhNmI1MDRhMh8FBQZDYWwgWUNkZAKDAQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9Zjk2Y2EwNGEtOTUzZi00OGI5LTlhMWMtNjQ3OWFjOWQyODdjHwUFCEJheWZpZWxkZGQChAEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPThjYzRlOGI0LTZjMjgtNDIxMC1hNzM5LTYxZDk0OGIzMWQ5Yh8FBQpMb25nIEJlYWNoZGQChQEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTFmZmZiMzQxLTg4ZmUtNDEyNC1hZWUwLTg2MjA2NDYyZTk1MB8FBQ9FdGNoZWxscyBXb3JsZHNkZAKGAQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9ZDFiNjg2MzctNTZlMC00M2NlLWEwZGMtYTc0MjFmMjgwODFhHwUFHkxha2UgTWlubmV0b25rYSBTYWlsaW5nIFNjaG9vbGRkAocBD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD0wOWQ4ZjZmMC0zM2I2LTQxZWMtYWNhZC1kNmRhNjhmZmIzN2YfBQUFU0JZUkFkZAKIAQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MWI0ZWYwNDUtZmE3MS00ZTRkLThlM2UtYjZhZmYxZDdmNDdhHwUFJkxha2UgQmFsZHdpbiBGbG9yaWRhIENvbW11bml0eSBTYWlsaW5nZGQCiQEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTgyNmE5YmNkLWE5ZmItNGY1MS1hMWQ2LTBjZmEyYjM3YzFjZh8FBRZDZWRhciBQb2ludCBZYWNodCBDbHViZGQCigEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTQ1YjQxOTMzLTlkMjAtNDdiZi1hZGI0LTc4OTIxY2MwNzM3ZR8FBRJFYXN0ZXJuIFlhY2h0IENsdWJkZAKLAQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MDE5N2UxNjYtZDQzNi00MTYyLWFmMDYtZjFmZWVjZTQ2NmM4HwUFCVZlbG9jaXRla2RkAowBD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD1mYjY1NmZkOC0wNTMxLTQ4OTktYTU1Mi02YzEzNmNmZDI2ZDcfBQUdQmVuZXRlYXUgMzYuNyBOb3J0aCBBbWVyaWNhbnNkZAKNAQ9kFgJmD2QWAgIBDw8WBB8EBT1yZWdhdHRhLmFzcHg%2FWWFjaHRDbHViSUQ9MTk5NzczMDUtYTFmNC00MmQzLWIzZTgtZDJhYzQzZDY3OGFkHwUFFVdpbmR5IENpdHkgTWF0Y2ggUmFjZWRkAo4BD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD0wMGFhMDc3Ny03OTA2LTRkYWQtYjkwNS03YTRiMTQxOGI5OGUfBQUPTmV3cG9ydCBSZWdhdHRhZGQCjwEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPWMzZGNjMmM2LWQ4YjEtNGMwMC1iZTM2LWJkZjM1MzRiYzEzMx8FBRZOYW50dWNrZXQgSW52aXRhdGlvbmFsZGQCkAEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTNhNDE3OGE4LWYzNjktNGM5NC1hNDE0LWZlMzY5ZmM4YzM1NR8FBRZOQ0FTQSBBIFNjb3cgTmF0aW9uYWxzZGQCkQEPZBYCZg9kFgICAQ8PFgQfBAU9cmVnYXR0YS5hc3B4P1lhY2h0Q2x1YklEPTdlMGE4MmUxLTM2YzYtNDI1OC05NmNhLWRhYjBkYWQzYjY0Nh8FBRRQZW5zYWNvbGEgWWFjaHQgQ2x1YmRkApIBD2QWAmYPZBYCAgEPDxYEHwQFPXJlZ2F0dGEuYXNweD9ZYWNodENsdWJJRD03NWU2MGJiYS1iZjIzLTQwYjYtOTViOS04NjhlODBjYjM0NjQfBQUPUHJlbWllcmUgUmFjaW5nZGQCkwEPDxYCHwBoZGQYAgUeX19Db250cm9sc1JlcXVpcmVQb3N0QmFja0tleV9fFgEFDUNoZWNrQm94X1NvcnQFCUdyaWRWaWV3MQ88KwAMAQgCAWTUq4SkdvPe3JZF%2BedoXCo3QA2UDmU88o%2BCALkCeD%2BVUA%3D%3D&__VIEWSTATEGENERATOR=F011CD8B&__EVENTVALIDATION=%2FwEdAANUWRKn3l2AbFyT%2FS8ed0%2FaZ5rn5uSrYLZZLMC5W6mBLdANxm5xgQJBpGtMpgu3WSqRgFXq532%2FAlINerw49hMNRC97vcVn4OVe%2F4Vl7HAEZw%3D%3D&TextBox_Search=';
    const alphabet = 'a b c d e f g h i j k l m n o p q r s t u v q x y z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 1 2 3 4 5 6 7 8 9 0 _'.split(
        ' '
    );
    await fetchAndSaveClubs();
    // TODO: Make all URLs, cookies, headers, etc part of kattack metadata.
    // TODO: make FEED_LIMIT part of kattack metadaa.

    let existingUrls;
    try {
        existingUrls = await getExistingUrls(SOURCE);
    } catch (err) {
        console.log('Error getting existing urls', err);
        process.exit();
    }
    let counter = 100;
    console.log('Looking for new feed IDs...');
    while (counter < FEED_LIMIT) {
        console.log(`Checking for feed ${counter} of ${FEED_LIMIT}...`);
        const raceUrl = `http://kws.kattack.com/GEPlayer/GMPosDisplay.aspx?FeedID=${counter.toString()}`;
        if (existingUrls.includes(raceUrl)) {
            counter++;
            continue;
        }
        try {
            const feedPage = await axios.get(raceUrl);
            const pageText = feedPage.data.toString();
            const errorMsg = `Error: Invalid Feed ID: ${counter.toString()}`;
            if (pageText.includes(errorMsg)) {
                await registerFailedUrl(SOURCE, raceUrl, errorMsg);
            } else {
                feedIds[counter] = counter;
            }
        } catch (err) {
            console.log(`Error getting feed race with url ${raceUrl}`, err);
            await registerFailedUrl(SOURCE, raceUrl, err.toString());
        }
        counter++;
    }

    const todaysDate = new Date();

    // TODO: clean up all requests into a common method and unify feed and race loops since they're identical
    console.log('Downloading new feeds...');
    // Get the Feed data (feeds are like big races.) No need to check if this id exists in db since feedIds was already populated.
    for (const feedIndex in Object.keys(feedIds)) {
        const feedId = Object.keys(feedIds)[feedIndex];
        const raceUrl = `http://kws.kattack.com/GEPlayer/GMPosDisplay.aspx?FeedID=${feedId}`;
        try {
            const objectsToSave = {};
            console.log(`Scraping race feed with url ${raceUrl}`);
            const feedMetadataRequest = await axios({
                method: 'post',
                url:
                    'http://kws.kattack.com/GEPlayer/GMWebService.asmx/LiveFeed_select',
                data: '{ "feedID": "' + feedId + '"}',
                headers: {
                    Connection: 'keep-alive',
                    Host: 'kws.kattack.com',
                    Accept: '*/*',
                    Cookie:
                        'ASP.NET_SessionId=4tzo1aa2ed1oh0k1zu1jqtly; __utmc=59827767; __utmz=59827767.1598381375.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=59827767.1134480228.1598381375.1598722255.1598725437.6; __utmt=1; __utmb=59827767.2.10.159872543',
                    Origin: 'http://kws.kattack.com',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate',
                    Referer:
                        'http://kws.kattack.com/GEPlayer/GMPlayer.aspx??FeedID=' +
                        feedId,
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
                },
            });
            const metadata = feedMetadataRequest.data.d;

            // If this race starts or stops in the future, ignore it. We'll get it next time.
            const startDate = new Date(
                parseInt(
                    metadata.StartTime.replace('/Date(', '').replace(')/', '')
                )
            );
            const stopDate = new Date(
                parseInt(
                    metadata.StopTime.replace('/Date(', '').replace(')/', '')
                )
            );
            if (todaysDate < startDate || todaysDate < stopDate) {
                console.log('This race is in the future so lets skip it.');
                continue;
            }

            console.log('Saving race...');
            const currentRace = {};
            currentRace.id = uuidv4();
            currentRace.original_id = feedId;
            currentRace.name = metadata.Name;
            currentRace.original_paradigm = 'Feed';
            currentRace.yacht_club = null;
            currentRace.original_yacht_club_id = metadata.YachtClubID;
            currentRace.original_fleet_id = metadata.FleetID;
            currentRace.original_series_id = metadata.SeriesID;
            currentRace.original_course_id = metadata.CourseID;
            currentRace.start = metadata.StartTime.replace(
                '/Date(',
                ''
            ).replace(')/', '');
            currentRace.stop = metadata.StopTime.replace('/Date(', '').replace(
                ')/',
                ''
            );
            currentRace.days = metadata.Days;
            currentRace.sleep_hour = metadata.SleepHour;
            currentRace.wake_hour = metadata.WakeHour;
            currentRace.heartbeat_int_sec = metadata.HeartbeatIntSec;
            currentRace.wait_samp_int_sec = metadata.WaitSampIntSec;
            currentRace.active_samp_int_sec = metadata.ActiveSampIntSec;
            currentRace.active_pts = metadata.ActivePts;
            currentRace.still_pts = metadata.StillPts;
            currentRace.still_radius_met = metadata.StillRadiusMet;
            currentRace.upload_int_sec = metadata.UploadIntSec;
            currentRace.modified_time = metadata.ModifiedTime.replace(
                '/Date(',
                ''
            ).replace(')/', '');
            currentRace.password = metadata.Password;
            currentRace.race_start_time_utc = metadata.RaceStartTimeUTC.replace(
                '/Date(',
                ''
            ).replace(')/', '');
            currentRace.feed_start_time_epoch_offset_sec =
                metadata.FeedStartTimeEPOCHOffsetSec;
            currentRace.prestart_length_sec = metadata.PrestartLengthSec;
            currentRace.race_start_time_epoch_offset_sec =
                metadata.RaceStartTimeEPOCHOffsetSec;
            currentRace.race_finish_time_epoch_offset_sec =
                metadata.RaceFinishTimeEPOCHOffsetSec;
            currentRace.feed_length_sec = metadata.FeedLengthSec;
            currentRace.race_length_sec = metadata.RaceLengthSec;
            currentRace.is_distance_race = metadata.IsDistanceRace;
            currentRace.is_open_feed = metadata.IsOpenFeed;
            currentRace.speed_filter_kts = metadata.SpeedFilterKts;
            currentRace.is_live = metadata.IsLive;
            currentRace.has_started = metadata.HasStarted;
            currentRace.lon = metadata.Lon;
            currentRace.lat = metadata.Lat;
            currentRace.course_heading_deg = metadata.CourseHeadingDeg;
            currentRace.js_race_feed_id = metadata.JSRaceFeedID;
            currentRace.js_race_course_id = metadata.JSRaceCourseID;
            currentRace.url = raceUrl;

            const leaderboardRequest = await axios.get(
                'http://kws.kattack.com/GEPlayer/GELeaderBoard.aspx?FeedID=' +
                    feedId +
                    '&CourseID=' +
                    metadata.CourseID
            );
            const leaderboardData = leaderboardRequest.data;

            currentRace.leaderboard_data = leaderboardData;

            console.log('Saving waypoints...');
            const courseWaypointRequest = await axios({
                method: 'post',
                url:
                    'http://kws.kattack.com/GEPlayer/GMWebService.asmx/Waypoint_selectCourseWaypointList',
                data:
                    '{ "courseID": "' +
                    metadata.CourseID +
                    '", "feedID": "' +
                    feedId +
                    '"}',
                headers: {
                    Connection: 'keep-alive',
                    Host: 'kws.kattack.com',
                    Accept: '*/*',
                    Cookie:
                        'ASP.NET_SessionId=4tzo1aa2ed1oh0k1zu1jqtly; __utmc=59827767; __utmz=59827767.1598381375.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=59827767.1134480228.1598381375.1598722255.1598725437.6; __utmt=1; __utmb=59827767.2.10.159872543',
                    Origin: 'http://kws.kattack.com',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    Referer:
                        'http://kws.kattack.com/GEPlayer/GMPlayer.aspx??FeedID=' +
                        feedId,
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
                },
            });
            const waypointArray = courseWaypointRequest.data.d;
            const waypoints = [];
            if (waypointArray !== undefined) {
                waypointArray.forEach((w) => {
                    const waypoint = {
                        id: uuidv4(),
                        original_id: w.ID,
                        race: currentRace.id,
                        original_race_id: currentRace.original_id,
                        html_description: w.HTMLDesc,
                        name: w.Name,
                        yacht_club: null,
                        original_yacht_club_id: w.YachtClubID,
                        lon: w.Lon,
                        lat: w.Lat,
                        epoch_offset_sec: w.point.epochOffsetSec,
                    };
                    waypoints.push(waypoint);
                });
            }

            // const routeWaypointRequest = await axios({
            //     method: 'post',
            //     url:
            //         'http://kws.kattack.com/GEPlayer/GMWebService.asmx/Waypoint_selectRoutePointList',
            //     data: '{ "courseID": "' + metadata.CourseID + '"}',
            //     headers: {
            //         Connection: 'keep-alive',
            //         Host: 'kws.kattack.com',
            //         Accept: '*/*',
            //         Cookie:
            //             'ASP.NET_SessionId=4tzo1aa2ed1oh0k1zu1jqtly; __utmc=59827767; __utmz=59827767.1598381375.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=59827767.1134480228.1598381375.1598722255.1598725437.6; __utmt=1; __utmb=59827767.2.10.159872543',
            //         Origin: 'http://kws.kattack.com',
            //         'X-Requested-With': 'XMLHttpRequest',
            //         'Cache-Control': 'no-cache',
            //         Pragma: 'no-cache',
            //         'Content-Type': 'application/json; charset=UTF-8',
            //         'Accept-Language': 'en-US,en;q=0.9',
            //         Referer:
            //             'http://kws.kattack.com/GEPlayer/GMPlayer.aspx??FeedID=' +
            //             feedId,
            //         'User-Agent':
            //             'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
            //     },
            // });
            // const routeWaypointData = routeWaypointRequest.data.d;
            // TODO: figure out routes
            // console.log(routeWaypointData);

            const deviceMetadataRequest = await axios({
                method: 'post',
                url:
                    'http://kws.kattack.com/GEPlayer/GMWebService.asmx/LiveDevice_selectFromData',
                data: '{ "feedID": "' + feedId + '"}',
                headers: {
                    Connection: 'keep-alive',
                    Host: 'kws.kattack.com',
                    Accept: '*/*',
                    Cookie:
                        'ASP.NET_SessionId=4tzo1aa2ed1oh0k1zu1jqtly; __utmc=59827767; __utmz=59827767.1598381375.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=59827767.1134480228.1598381375.1598722255.1598725437.6; __utmt=1; __utmb=59827767.2.10.159872543',
                    Origin: 'http://kws.kattack.com',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    Referer:
                        'http://kws.kattack.com/GEPlayer/GMPlayer.aspx??FeedID=' +
                        feedId,
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
                },
            });
            const deviceMetadata = deviceMetadataRequest.data.d;

            // TODO: unique device ids
            console.log('Saving positions...');
            const positions = [];
            const devices = [];
            for (const deviceIndex in deviceMetadata) {
                const deviceData = deviceMetadata[deviceIndex];
                const device = {
                    id: uuidv4(),
                    original_id: deviceData.DeviceDGuid,
                    race: currentRace.id,
                    original_race_id: currentRace.original_id,
                    name: deviceData.DeviceName,
                    type: deviceData.DeviceType,
                    lon: deviceData.Lon,
                    lat: deviceData.Lat,
                    last_course_pt_lon: deviceData.LastCoursePtLon,
                    last_course_pt_lat: deviceData.LastCoursePtLat,
                    speed_kts: deviceData.SpeedKts,
                    heading_deg: deviceData.HeadingDeg,
                    mode: deviceData.Mode,
                    status: deviceData.Status,
                    is_logging: deviceData.IsLogging,
                    is_blocked: deviceData.IsBlocked,
                    device_row_id: deviceData.DeviceRowID,
                    yacht_club: null,
                    original_yacht_club_id: deviceData.YachtClubID,
                    shared_device_row_id: deviceData.SharedDeviceRowID,
                    status_msg: deviceData.StatusMsg,
                    device_internal_name: deviceData.DeviceInternalName,
                    epoch_offset_sec: deviceData.epochOffsetSec,
                    elapsed_time_dhms: deviceData.ElapsedTimeDHMS,
                    info_html: deviceData.InfoHTML,
                    info_html_2: deviceData.InfoHTML2,
                    js_data_id: deviceData.JSDataID,
                };
                devices.push(device);

                // TODO: get gpx via DownloadGPX.ashx?FeedID=" + feedID + "&DeviceDGuid=" + button.id;

                const deviceDetailRequest = await axios({
                    method: 'post',
                    url:
                        'http://kws.kattack.com/GEPlayer/GMWebService.asmx/LiveData_selectDeviceList',
                    data:
                        '{ "deviceRowID": "' +
                        deviceData.DeviceRowID +
                        '", "feedID": "' +
                        feedId +
                        '"}',
                    headers: {
                        Connection: 'keep-alive',
                        Host: 'kws.kattack.com',
                        Accept: '*/*',
                        Cookie:
                            'ASP.NET_SessionId=4tzo1aa2ed1oh0k1zu1jqtly; __utmc=59827767; __utmz=59827767.1598381375.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=59827767.1134480228.1598381375.1598722255.1598725437.6; __utmt=1; __utmb=59827767.2.10.159872543',
                        Origin: 'http://kws.kattack.com',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Cache-Control': 'no-cache',
                        Pragma: 'no-cache',
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Accept-Encoding': 'gzip, deflate',
                        'Accept-Language': 'en-US,en;q=0.9',
                        Referer:
                            ' http://kws.kattack.com/GEPlayer/GMPlayer.aspx?FeedID=' +
                            feedId,
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
                    },
                });
                const devicePositions = deviceDetailRequest.data.d;

                // TODO: get new ids for device_id
                devicePositions.forEach((p) => {
                    const position = {
                        id: uuidv4(),
                        device: device.id,
                        original_device_id: deviceData.DeviceDGuid,
                        race: currentRace.id,
                        original_race_id: currentRace.original_id,
                        lon: p.lon,
                        lat: p.lat,
                        time: p.time.replace('/Date(', '').replace(')/', ''),
                        speed_kts: p.speedKts,
                        distance_nm: p.distanceNM,
                        heading_deg: p.headingDeg,
                        epoch_offset_sec: p.epochOffsetSec,
                    };

                    positions.push(position);
                });
            }
            objectsToSave.KattackRace = [currentRace];
            objectsToSave.KattackDevice = devices;
            objectsToSave.KattackPosition = positions;
            objectsToSave.KattackWaypoint = waypoints;

            try {
                await createAndSendTempJsonFile(objectsToSave);
            } catch (err) {
                console.log(
                    `Failed creating and sending temp json file for url ${raceUrl}`
                );
                throw err;
            }
            console.log('Finished scraping race.');
        } catch (err) {
            console.log(err);
            await registerFailedUrl(SOURCE, raceUrl, err.toString());
        }
    }
    console.log('Finished scraping all new feeds.');

    console.log('Searching through alphabet for new races...');
    for (const index in alphabet) {
        const search = alphabet[index];
        console.log(`Making search request for character: ${search}`);
        let searchRequest;
        try {
            searchRequest = await axios({
                method: 'post',
                url: 'http://kws.kattack.com/player/browselist.aspx',
                data: SEARCH_REQUEST_DATA_STRING + search,
                headers: {
                    Connection: 'keep-alive',
                    Accept:
                        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    Origin: 'http://kws.kattack.com',
                    'Cache-Control': ' max-age=0',
                    'Upgrade-Insecure-Requests': '1',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept-Language': 'en-US,en;q=0.9',
                    Referer: ' http://kws.kattack.com/player/browselist.aspx',
                    Cookie:
                        'ASP.NET_SessionId=4tzo1aa2ed1oh0k1zu1jqtly; __utmc=59827767; __utmz=59827767.1598381375.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=59827767.1134480228.1598381375.1598535817.1598712899.3; __utmb=59827767.2.10.1598712899',
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
                },
            });
        } catch (err) {
            console.log(`Failed searching races for alphabet ${search}`, err);
            continue;
        }
        const resultData = searchRequest.data.toString();

        console.log('Parsing out race ids from current search results...');
        const regexp = /https*:\/\/kws\.kattack\.com\/BPlayer\/BuoyPlayer\.aspx\?RaceID=[a-zA-Z0-9-]*"/g;
        const matches = resultData.toString().match(regexp);
        for (const matchIndex in matches) {
            const match = matches[matchIndex].replace('"', '');
            const idRegex = /RaceID=([a-zA-Z0-9-]*)/;

            const id = match.match(idRegex)[1];
            raceIds[id] = match;
        }
    }

    // TODO: Do races use relative lon and lat? Why are the position data centered around 0,0?
    // Now we get the race data.
    console.log('Scraping all new races...');
    for (const raceIndex in Object.keys(raceIds)) {
        console.log(
            'Getting race number ' +
                raceIndex +
                ' of ' +
                Object.keys(raceIds).length
        );
        const raceId = Object.keys(raceIds)[raceIndex];
        const raceUrl = `http://kws.kattack.com/BPlayer/BuoyPlayer.aspx?RaceID=${raceId}`;

        if (existingUrls.includes(raceUrl)) {
            console.log(`Url already exist in database ${raceUrl}. Skipping.`);
            continue;
        }
        console.log(`Scraping new race with id ${raceId}`);
        try {
            const objectsToSave = {};
            const raceMetadataRequest = await axios({
                method: 'post',
                url:
                    'http://kws.kattack.com/BPlayer/JSRaceData.KRF.asmx/LiveFeed_select',
                data: '{ "feedID_raceGuid": "' + raceId + '"}',
                headers: {
                    Connection: 'keep-alive',
                    Host: 'kws.kattack.com',
                    Accept: '*/*',
                    Cookie:
                        'ASP.NET_SessionId=4tzo1aa2ed1oh0k1zu1jqtly; __utmc=59827767; __utmz=59827767.1598381375.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=59827767.1134480228.1598381375.1598722255.1598725437.6; __utmt=1; __utmb=59827767.2.10.159872543',
                    Origin: 'http://kws.kattack.com',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    Referer:
                        ' http://kws.kattack.com/BPlayer/BPlayer.aspx?RaceID=' +
                        raceId,
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
                },
            });

            const metadata = raceMetadataRequest.data.d;

            // If this race starts or stops in the future, ignore it. We'll get it next time.
            const startDate = new Date(
                parseInt(
                    metadata.StartTime.replace('/Date(', '').replace(')/', '')
                )
            );
            const stopDate = new Date(
                parseInt(
                    metadata.StopTime.replace('/Date(', '').replace(')/', '')
                )
            );
            if (todaysDate < startDate || todaysDate < stopDate) {
                console.log('This race is in the future so lets skip it.');
                continue;
            }
            const currentRace = {};
            currentRace.id = uuidv4();
            currentRace.original_id = raceId;
            currentRace.name = metadata.Name;
            currentRace.original_paradigm = 'Race';
            currentRace.yacht_club = null;
            currentRace.original_yacht_club_id = metadata.YachtClubID;
            currentRace.original_fleet_id = metadata.FleetID;
            currentRace.original_series_id = metadata.SeriesID;
            currentRace.original_course_id = metadata.CourseID;
            currentRace.start = metadata.StartTime.replace(
                '/Date(',
                ''
            ).replace(')/', '');
            currentRace.stop = metadata.StopTime.replace('/Date(', '').replace(
                ')/',
                ''
            );
            currentRace.days = metadata.Days;
            currentRace.sleep_hour = metadata.SleepHour;
            currentRace.wake_hour = metadata.WakeHour;
            currentRace.heartbeat_int_sec = metadata.HeartbeatIntSec;
            currentRace.wait_samp_int_sec = metadata.WaitSampIntSec;
            currentRace.active_samp_int_sec = metadata.ActiveSampIntSec;
            currentRace.active_pts = metadata.ActivePts;
            currentRace.still_pts = metadata.StillPts;
            currentRace.still_radius_met = metadata.StillRadiusMet;
            currentRace.upload_int_sec = metadata.UploadIntSec;
            currentRace.modified_time = metadata.ModifiedTime.replace(
                '/Date(',
                ''
            ).replace(')/', '');
            currentRace.password = metadata.Password;
            currentRace.race_start_time_utc = metadata.RaceStartTimeUTC.replace(
                '/Date(',
                ''
            ).replace(')/', '');
            currentRace.feed_start_time_epoch_offset_sec =
                metadata.FeedStartTimeEPOCHOffsetSec;
            currentRace.prestart_length_sec = metadata.PrestartLengthSec;
            currentRace.race_start_time_epoch_offset_sec =
                metadata.RaceStartTimeEPOCHOffsetSec;
            currentRace.race_finish_time_epoch_offset_sec =
                metadata.RaceFinishTimeEPOCHOffsetSec;
            currentRace.feed_length_sec = metadata.FeedLengthSec;
            currentRace.race_length_sec = metadata.RaceLengthSec;
            currentRace.is_distance_race = metadata.IsDistanceRace;
            currentRace.is_open_feed = metadata.IsOpenFeed;
            currentRace.speed_filter_kts = metadata.SpeedFilterKts;
            currentRace.is_live = metadata.IsLive;
            currentRace.has_started = metadata.HasStarted;
            currentRace.lon = metadata.Lon;
            currentRace.lat = metadata.Lat;
            currentRace.course_heading_deg = metadata.CourseHeadingDeg;
            currentRace.js_race_feed_id = metadata.JSRaceFeedID;
            currentRace.js_race_course_id = metadata.JSRaceCourseID;
            currentRace.url = raceUrl;

            // let leaderboardRequest = await axios.get('http://kws.kattack.com/GEPlayer/GELeaderBoard.aspx?FeedID=' + feedId  + '&CourseID=' + metadata.CourseID)
            // let leaderboardData = leaderboardRequest.data

            // currentRace.leaderboard_data = leaderboardData

            // What does "notUsed" do?

            const courseRequest = await axios({
                method: 'post',
                url:
                    'http://kws.kattack.com/BPlayer/JSRaceData.KRF.asmx/Waypoint_selectCourseWaypointList',
                data: '{ "courseID_raceGuid": "' + raceId + '", "notUsed": 0 }',
                headers: {
                    Connection: 'keep-alive',
                    Host: 'kws.kattack.com',
                    Accept: '*/*',
                    Cookie:
                        'ASP.NET_SessionId=4tzo1aa2ed1oh0k1zu1jqtly; __utmc=59827767; __utmz=59827767.1598381375.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=59827767.1134480228.1598381375.1598722255.1598725437.6; __utmt=1; __utmb=59827767.2.10.159872543',
                    Origin: 'http://kws.kattack.com',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    Referer:
                        ' http://kws.kattack.com/BPlayer/BPlayer.aspx?RaceID=' +
                        raceId,
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
                },
            });
            console.log('Getting waypoints...');
            const waypointArray = courseRequest.data.d;
            const waypoints = [];
            if (waypointArray !== undefined) {
                waypointArray.forEach((w) => {
                    const waypoint = {
                        id: uuidv4(),
                        original_id: w.ID,
                        race: currentRace.id,
                        original_race_id: currentRace.original_id,
                        html_description: w.HTMLDesc,
                        name: w.Name,
                        yacht_club: null,
                        original_yacht_club_id: w.YachtClubID,
                        lon: w.Lon,
                        lat: w.Lat,
                        epoch_offset_sec: w.point.epochOffsetSec,
                    };
                    waypoints.push(waypoint);
                });
            }

            const deviceMetadataRequest = await axios({
                method: 'post',
                url:
                    'http://kws.kattack.com/BPlayer/JSRaceData.KRF.asmx/LiveDevice_selectFromData',
                data: '{ "feedID_raceGuid": "' + raceId + '"}',
                headers: {
                    Connection: 'keep-alive',
                    Host: 'kws.kattack.com',
                    Accept: '*/*',
                    Cookie:
                        'ASP.NET_SessionId=4tzo1aa2ed1oh0k1zu1jqtly; __utmc=59827767; __utmz=59827767.1598381375.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=59827767.1134480228.1598381375.1598722255.1598725437.6; __utmt=1; __utmb=59827767.2.10.159872543',
                    Origin: 'http://kws.kattack.com',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    Referer:
                        ' http://kws.kattack.com/BPlayer/BPlayer.aspx?RaceID=' +
                        raceId,
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
                },
            });

            const deviceMetadata = deviceMetadataRequest.data.d;

            const positions = [];
            const devices = [];
            console.log('Getting positions...');
            for (const deviceIndex in deviceMetadata) {
                const deviceData = deviceMetadata[deviceIndex];

                const boatName = deviceData.DeviceName;

                const device = {
                    id: uuidv4(),
                    original_id: deviceData.DeviceDGuid,
                    race: currentRace.id,
                    original_race_id: currentRace.original_id,
                    name: deviceData.DeviceName,
                    type: deviceData.DeviceType,
                    lon: deviceData.Lon,
                    lat: deviceData.Lat,
                    last_course_pt_lon: deviceData.LastCoursePtLon,
                    last_course_pt_lat: deviceData.LastCoursePtLat,
                    speed_kts: deviceData.SpeedKts,
                    heading_deg: deviceData.HeadingDeg,
                    mode: deviceData.Mode,
                    status: deviceData.Status,
                    is_logging: deviceData.IsLogging,
                    is_blocked: deviceData.IsBlocked,
                    device_row_id: deviceData.DeviceRowID,
                    yacht_club: null,
                    original_yacht_club_id: deviceData.YachtClubID,
                    shared_device_row_id: deviceData.SharedDeviceRowID,
                    status_msg: deviceData.StatusMsg,
                    device_internal_name: deviceData.DeviceInternalName,
                    epoch_offset_sec: deviceData.epochOffsetSec,
                    elapsed_time_dhms: deviceData.ElapsedTimeDHMS,
                    info_html: deviceData.InfoHTML,
                    info_html_2: deviceData.InfoHTML2,
                    js_data_id: deviceData.JSDataID,
                };
                devices.push(device);

                const deviceDetailRequest = await axios({
                    method: 'post',
                    url:
                        'http://kws.kattack.com/BPlayer/JSRaceData.KRF.asmx/LiveData_selectDeviceList',
                    data:
                        '{ "feedID_raceGuid": "' +
                        raceId +
                        '", "deviceRowID_boatName": "' +
                        boatName +
                        '"}',
                    headers: {
                        Connection: 'keep-alive',
                        Host: 'kws.kattack.com',
                        Accept: '*/*',
                        Cookie:
                            'ASP.NET_SessionId=4tzo1aa2ed1oh0k1zu1jqtly; __utmc=59827767; __utmz=59827767.1598381375.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=59827767.1134480228.1598381375.1598722255.1598725437.6; __utmt=1; __utmb=59827767.2.10.159872543',
                        Origin: 'http://kws.kattack.com',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Cache-Control': 'no-cache',
                        Pragma: 'no-cache',
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Accept-Encoding': 'gzip, deflate',
                        'Accept-Language': 'en-US,en;q=0.9',
                        Referer:
                            ' http://kws.kattack.com/BPlayer/BPlayer.aspx?RaceID=' +
                            raceId,
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
                    },
                });
                const devicePositions = deviceDetailRequest.data.d;

                // TODO: get new ids for device_id
                devicePositions.forEach((p) => {
                    const position = {
                        id: uuidv4(),
                        device: device.id,
                        original_device_id: deviceData.DeviceDGuid,
                        race: currentRace.id,
                        original_race_id: currentRace.original_id,
                        lon: p.lon,
                        lat: p.lat,
                        time: p.time.replace('/Date(', '').replace(')/', ''),
                        speed_kts: p.speedKts,
                        distance_nm: p.distanceNM,
                        heading_deg: p.headingDeg,
                        epoch_offset_sec: p.epochOffsetSec,
                    };
                    positions.push(position);
                });
            }

            objectsToSave.KattackRace = [currentRace];
            objectsToSave.KattackDevice = devices;
            objectsToSave.KattackPosition = positions;
            objectsToSave.KattackWaypoint = waypoints;
            try {
                await createAndSendTempJsonFile(objectsToSave);
            } catch (err) {
                console.log(
                    `Failed creating and sending temp json file for url ${raceUrl}`
                );
                throw err;
            }
        } catch (err) {
            console.log(err);
            await registerFailedUrl(SOURCE, raceUrl, err.toString());
        }
        console.log('Finished scraping races from alphabet searches.');
    }
    console.log('Finished scraping all races.');

    process.exit();
})();

async function fetchAndSaveClubs() {
    console.log('Fetching clubs');
    const yachtClubListPage = await axios.get(
        'http://kws.kattack.com/player/browselist.aspx'
    );
    const clubRegex = /regatta.aspx\?YachtClubID=[a-zA-Z0-9-]*" style="display:inline-block;">.*<\/a>/g;
    const clubMatches = yachtClubListPage.data.toString().match(clubRegex);
    const clubs = [];
    for (const matchIndex in clubMatches) {
        const match = clubMatches[matchIndex];
        const extractor = /regatta.aspx\?YachtClubID=([a-zA-Z0-9-]*)" style="display:inline-block;">(.*)<\/a>/;
        const results = match.match(extractor);
        const club = {
            id: uuidv4(),
            original_id: results[1],
            name: results[2],
            external_url: null,
        };
        clubs.push(club);
    }
    console.log('Saving new clubs...');
    for (const clubIndex in clubs) {
        const club = clubs[clubIndex];
        const clubPage = await axios.get(
            'http://kws.kattack.com/player/regatta.aspx?YachtClubID=' +
                club.original_id
        );
        const clubData = clubPage.data.toString();
        const externalUrlRegex = /<a id="Image_Banner" href="(.*)"><img src/;
        club.external_url = clubData.match(externalUrlRegex)[1];
    }
    try {
        await createAndSendTempJsonFile({
            KattackRace: [], // Used by raw-data-server to know its for kattack scraper
            KattackYachtClub: clubs,
        });
    } catch (err) {
        console.log(
            'Failed creating and sending temp json file for clubs',
            err
        );
    }
}
