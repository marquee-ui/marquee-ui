# Marquee Tide identity

The same identity works for the organization and repository:

- `marquee-tide-512.png`: 512 × 512 organization avatar, with a solid Tide mint background.
- `marquee-tide-1024.png`: 1024 × 1024 master of the same mark.
- `marquee-github-social.png`: 1280 × 640 repository social preview, using the same mark and Tide palette.

The square mark is exported from the website's actual `.logo-mark`, including its
Boldonse face and spacing. Colors come from the Tide preset; no separate palette
or replacement lettering is introduced. The solid background works in both light
and dark GitHub interfaces.

GitHub uses an organization profile image and a separate wide repository social
preview, rather than requiring a second logo design. Upload the square in the
organization settings and the wide image under the repository's **Settings →
Social preview**. These files are prepared locally; no GitHub setting was changed.

To regenerate from a running, built docs preview:

```sh
node scripts/export-brand.mjs http://localhost:4174/marquee-ui/
```

The exporter uses the repo's Playwright Chromium and waits for the local font.
Font licenses remain in `packages/tokens/fonts/`.

[GitHub profile image guidance](https://docs.github.com/en/account-and-profile/reference/profile-reference)
and [repository social preview guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview).
