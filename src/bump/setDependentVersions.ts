import type { BeachballOptions } from '../types/BeachballOptions';
import type { PackageInfos } from '../types/PackageInfo';
import { bumpMinSemverRange } from './bumpMinSemverRange';

export function setDependentVersions(
  packageInfos: PackageInfos,
  scopedPackages: Set<string>,
  { verbose }: BeachballOptions
): Set<string> {
  const modifiedPackages = new Set<string>();
  Object.keys(packageInfos).forEach(pkgName => {
    if (!scopedPackages.has(pkgName)) {
      return;
    }

    const info = packageInfos[pkgName];
    const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'] as const;
    depTypes.forEach(depKind => {
      const deps = info[depKind];
      if (deps) {
        Object.keys(deps).forEach(dep => {
          const packageInfo = packageInfos[dep];
          if (packageInfo) {
            const existingVersionRange = deps[dep];
            const bumpedVersionRange = bumpMinSemverRange(packageInfo.version, existingVersionRange);
            if (existingVersionRange !== bumpedVersionRange) {
              deps[dep] = bumpedVersionRange;
              modifiedPackages.add(pkgName);
              if (verbose) {
                console.log(
                  `${pkgName} needs to be bumped because ${dep} ${existingVersionRange} -> ${bumpedVersionRange}`
                );
              }
            }
          }
        });
      }
    });
  });

  return modifiedPackages;
}
