## Note
This is a local adaptation of Greg Ziegan's useful [fetch-latest-release](https://github.com/gregziegan/fetch-latest-release) action. It has been moved here in order to update its dependencies and to grant us control over it.

## fetch-latest-release
A tiny GitHub action to fetch the latest GitHub release for a given repository

## Inputs

| Parameter           | Description                                                                                | Required | Default      |
| ------------------- | ------------------------------------------------------------------------------------------ | -------- | ------------ |
| `github_token`      | A Github token, usually `${{ github.token }}`.                                             | N        | `${{ github.token }}`  |
| `repo_path`         | Provide a "owner/repo" string for fetching from a different repo.                          | N        | The current repo       |

## Output

- `url` The HTTP URL for this release
- `assets_url`: The REST API HTTP URL for this release's assets
- `upload_url`: The REST API HTTP URL for uploading to this release
- `html_url`: The REST API HTTP URL for this release
- `id`: ''
- `node_id`: The unique identifier for accessing this release in the GraphQL API
- `tag_name`: The name of the release's Git tag
- `target_commitish`: ''
- `name`: The title of the release
- `body`: The description of the release
- `draft`: Whether or not the release is a draft
- `prerelease`: Whether or not the release is a prerelease
- `author_id`: ''
- `author_node_id`: The unique identifier for accessing this release's author in the GraphQL API
- `author_url`: The REST API HTTP URL for this release's author
- `author_login`: The username used to login.
- `author_html_url`: The HTTP URL for this release's author
- `author_type`: ''
- `author_site_admin`: Whether or not this user is a site administrator
