# Declarative TSX

Declarative TSX components developed for Timma SaaS client codebase

## Acknowledgements

Library boilerplate starter: https://github.com/alexjoverm/typescript-library-starter

## Dependencies

## Examples

### DataTable

```
import React, { Fragment } from "react"

import { DataTable } from "./declarative-components/src/DataTable"
import { data } from "./mockdata"
import { Selecter } from "./declarative-components/src/Tabbed"

const colors = ["red", "green", "blue", "yellow"] as ("red" | "green" | "blue" | "yellow")[]

class App extends React.Component<{}, { lastTouch: boolean; wrapped: any }> {
  public render() {
    return (
      <Selecter options={colors}>
        {(color, setColor) => (
          <Fragment>
            <nav>
              <select
                value={color}
                onChange={(e: any) => {
                  setColor(e.target.value)
                }}
              >
                {colors.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </nav>
            <DataTable data={data} rowHeight={18} initialSortField={"first_name"}>
              {(__, { THead, TBody, SortHeader }) => {
                return (
                  <Fragment>
                    <THead>
                      <tr style={{ color }}>
                        <SortHeader style={{ textAlign: "left" }} field="first_name">
                          First name
                        </SortHeader>
                        <SortHeader style={{ textAlign: "left" }} field="last_name">
                          Last name
                        </SortHeader>
                        <SortHeader style={{ textAlign: "left" }} field="email">
                          Email
                        </SortHeader>
                        <SortHeader field="gender">Gender</SortHeader>
                      </tr>
                    </THead>
                    <TBody>
                      {person => (
                        <Fragment>
                          <td>{person.first_name}</td>
                          <td>{person.last_name}</td>
                          <td>{person.email}</td>
                          <td style={{ textAlign: "center" }}>{person.gender}</td>
                        </Fragment>
                      )}
                    </TBody>
                  </Fragment>
                )
              }}
            </DataTable>
          </Fragment>
        )}
      </Selecter>
    )
  }
}
```
