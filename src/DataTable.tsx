import * as React from 'react'
import * as _ from 'lodash'
import { Subject, Subscription } from 'rxjs'
import * as ReactDOM from 'react-dom'

const defaultRowsBefore = 15
const defaultPadding = 15

export interface DatatableProps<T> {
  data: T[]
  rowHeight?: number
  anticipateRows?: number
  children: (
    DataTable: {
      THead: (
        props: React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLTableSectionElement>,
          HTMLTableSectionElement
        >
      ) => JSX.Element
      TBody: (
        props: React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLTableSectionElement>,
          HTMLTableSectionElement
        > & {
          children: (data: T) => JSX.Element
        }
      ) => JSX.Element
      Sort: (props: SortProps<T>) => JSX.Element
    },
    queryString: string,
    onSearch: (queryString: string) => void
  ) => JSX.Element
  initialSortField: keyof T
}
export interface DatatableState<T> {
  sortField: keyof T
  sortDirection: 'desc' | 'asc'
  searchString: string
  sortedData: T[]
}

export interface SortProps<T> {
  children: (sortDirection: 'desc' | 'asc' | 'none', toggleSort: () => void) => JSX.Element
  field: keyof T
}

interface DataTableBodyState {
  firstIndexOnScreen: number
  height: number
  lastIndexOnScreen: number
}

class DataTableBody<T> extends React.PureComponent<
  { data: T[]; rowHeight: number; anticipateRows?: number; children: (data: T) => JSX.Element },
  DataTableBodyState
> {
  private ref = React.createRef<HTMLTableSectionElement>()
  public scrollToTop = () => {
    const domNode = ReactDOM.findDOMNode(this.ref.current as any) as any
    domNode.scrollTop = 0
  }
  state: DataTableBodyState = {
    firstIndexOnScreen: 0,
    height: 500,
    lastIndexOnScreen: 100
  }
  onScroll = (e: any) => {
    const target: any = e.currentTarget
    const tableTop = target.scrollTop
    const firstIndexOnScreen = Math.floor(tableTop / this.props.rowHeight!)
    const lastIndexOnScreen = Math.ceil((tableTop + target.offsetHeight) / this.props.rowHeight!)
    this.setState({
      firstIndexOnScreen,
      lastIndexOnScreen
    })
  }
  render() {
    console.log('render dtablebody')
    const innerHeight = window.innerHeight
    console.log({ innerHeight })
    return (
      <tbody
        style={{
          display: 'block',
          overflowY: 'scroll',
          height: this.state.height
        }}
        onScroll={this.onScroll}
        ref={this.ref}
      >
        {_.chain(this.props.data)
          .map((data, idx) => {
            return { data, idx }
          })
          .groupBy(({ idx }) => {
            const before =
              idx < this.state.firstIndexOnScreen - (this.props.anticipateRows || defaultRowsBefore)
            const after =
              idx > this.state.lastIndexOnScreen + (this.props.anticipateRows || defaultRowsBefore)
            return before ? 'b' : after ? 'a' : 'v'
          })
          .map((d, key) => {
            if (key === 'a' || key === 'b') {
              const height = d.length * this.props.rowHeight
              return <div key={key} style={{ height }} />
            } else {
              return d.map(dp => (
                <tr
                  style={{
                    display: 'table',
                    width: '100%',
                    tableLayout: 'fixed'
                  }}
                  key={(dp as any).idx}
                >
                  {this.props.children(dp.data)}
                </tr>
              ))
            }
          })
          .flatten()
          .value()}
      </tbody>
    )
  }
  componentDidMount() {
    const domNode = ReactDOM.findDOMNode(this.ref.current as any) as any
    const rect = domNode.getBoundingClientRect()
    this.setState({
      height: window.innerHeight - rect.top - defaultPadding
    })
    window.onresize = () => {
      // Do something.
      const domNode = ReactDOM.findDOMNode(this.ref.current as any) as any
      const rect = domNode.getBoundingClientRect()
      this.setState({
        height: window.innerHeight - rect.top - defaultPadding
      })
    }
  }
}

export class DataTable<T> extends React.PureComponent<DatatableProps<T>, DatatableState<T>> {
  bodyRef = React.createRef<DataTableBody<T>>()
  static Td = (
    props: React.DetailedHTMLProps<
      React.TdHTMLAttributes<HTMLTableDataCellElement>,
      HTMLTableDataCellElement
    >
  ) => {
    return (
      <td
        {...props}
        style={{
          ...props.style,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden'
        }}
      />
    )
  }
  generatePdfSubject = new Subject()
  subscriptions: Subscription[] = []
  state: DatatableState<T> = {
    sortedData: this.props.data,
    searchString: '',
    sortDirection: 'desc',
    sortField: this.props.initialSortField
  }

  THead = (
    props: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLTableSectionElement>,
      HTMLTableSectionElement
    >
  ) => {
    return (
      <thead
        {...props}
        style={{
          ...props.style,
          display: 'table',
          width: '100%',
          tableLayout: 'fixed'
        }}
      />
    )
  }
  TBody = (
    props: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLTableSectionElement>,
      HTMLTableSectionElement
    > & {
      children: (data: T) => JSX.Element
    }
  ) => {
    return (
      <DataTableBody
        ref={this.bodyRef}
        data={this.state.sortedData}
        anticipateRows={this.props.anticipateRows}
        rowHeight={this.props.rowHeight!}
        children={props.children}
      />
    )
  }
  Sort = (props: SortProps<T>) => {
    return props.children(
      this.state.sortField === props.field ? this.state.sortDirection : 'none',
      () => {
        this.onSortFieldClick(props.field)
      }
    )
  }
  onSortFieldClick = (sortField: keyof T) => {
    // console.log(sortField, this.state.sortField)
    if (sortField === this.state.sortField) {
      // console.log("do the fucckkin toggle")
      this.setState(
        {
          sortDirection: this.state.sortDirection === 'asc' ? 'desc' : 'asc'
        },
        () => {
          this.reSortAndGroup()
        }
      )
    } else {
      this.setState(
        {
          sortField: sortField,
          sortDirection: 'desc'
        },
        () => {
          this.reSortAndGroup()
        }
      )
    }
  }
  onSearchStringChange = (searchString: string) => {
    this.setState(
      {
        searchString
      },
      () => {
        this.reSortAndGroup()
      }
    )
  }
  reSortAndGroup() {
    let sortedData = this.props.data.slice()
    // console.log("update")
    if (this.state.searchString.length > 0) {
      sortedData = sortedData.filter((d: any) => {
        const a = _.map(d, val => {
          if (typeof val === 'string') {
            return val.toLowerCase().indexOf(this.state.searchString.toLowerCase()) !== -1
          } else {
            return false
          }
        })
        return a.reduce((acc, val) => {
          return acc || val
        }, false)
      })
    }
    if (this.state.sortField) {
      sortedData = _.sortBy(sortedData, this.state.sortField)
    }
    sortedData = this.state.sortDirection === 'asc' ? sortedData : _.reverse(sortedData)
    // console.log(sortedData)
    this.setState(
      {
        sortedData
      },
      () => {
        this.bodyRef.current!.scrollToTop()
      }
    )
  }
  componentDidUpdate(prevProps: any) {
    if (this.props.data !== prevProps.data) {
      //  console.log(this.props.data)
      this.reSortAndGroup()
    }
  }
  render() {
    return this.props.children(
      {
        TBody: this.TBody,
        THead: this.THead,
        Sort: this.Sort
      },
      this.state.searchString,
      this.onSearchStringChange
    )
  }

  componentDidMount() {
    this.reSortAndGroup()
  }
}
