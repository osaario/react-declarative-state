# Declarative TSX

Declarative TSX components developed for Timma SaaS client codebase

## Acknowledgements

Library boilerplate starter: https://github.com/alexjoverm/typescript-library-starter

## Dependencies

## Examples

### DataTable

```
<DataTable data={data} rowHeight={18} initialSortField={"first_name"}>
  {(__, { THead, TBody, SortHeader }) => {
    return (
      <Fragment>
        <THead>
          <tr>
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
```
