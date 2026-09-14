import { FolderGit2Icon } from "lucide-react";

import { ProgressMeter } from "@/registry/groundwork/ui/progress-meter";
import { StatusPill } from "@/registry/groundwork/ui/status-pill";
import {
  DataTable,
  StackedCell,
  TableCard,
  TableCardHeader,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@/registry/groundwork/ui/table-card";

import { LOOP_FILES, RECENT_FEATURES } from "../kit";

/**
 * The hero's product shot, and not a picture of one: registry components rendering this
 * repo's own `context/features/` folders. The status is whether the folder holds a
 * `review.md`; the meter is how many of the loop's files it holds. Both read at build time.
 */
function FeatureTable({ className, rows }: { className?: string; rows?: number }) {
  return (
    <TableCard className={className}>
      <TableCardHeader icon={<FolderGit2Icon />} title="context/features" note="This repo, read at build time" />
      <DataTable density="comfortable" columns={["", "w-32", "w-24"]}>
        <Thead>
          <tr>
            <Th>Feature</Th>
            <Th>Status</Th>
            <Th align="right">Loop</Th>
          </tr>
        </Thead>
        <Tbody>
          {RECENT_FEATURES.slice(0, rows).map((feature) => (
            <Tr key={feature.id}>
              <Td>
                <StackedCell primary={feature.title} secondary={`${feature.id}-${feature.slug}`} />
              </Td>
              <Td>
                <StatusPill tone={feature.reviewed ? "success" : "info"}>
                  {feature.reviewed ? "Reviewed" : "Built"}
                </StatusPill>
              </Td>
              <Td align="right">
                <ProgressMeter
                  value={feature.loop / LOOP_FILES.length}
                  segments={LOOP_FILES.length}
                  label={`${feature.loop}/${LOOP_FILES.length}`}
                  className="justify-end"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </DataTable>
    </TableCard>
  );
}

export { FeatureTable };
