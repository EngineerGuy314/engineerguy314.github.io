
// basically a table where the first row is the column headers

export class TabularData
{
    constructor(dataTable)
    {
        this.dataTable = dataTable;

        this.col__idx = new Map();

        this.CacheHeaderLocations();
    }

    // return the number of data rows
    Length()
    {
        let retVal = 0;

        if (this.dataTable.length)
        {
            retVal = this.dataTable.length - 1;
        }

        return retVal;
    }

    CacheHeaderLocations()
    {
        if (this.dataTable && this.dataTable.length)
        {
            const headerRow = this.dataTable[0];
    
            for (let i = 0; i < headerRow.length; ++i)
            {
                const col = headerRow[i];
    
                this.col__idx.set(col, i);
            }
        }
    }

    Idx(col)
    {
        return this.col__idx.get(col);
    }

    // if given a row (array) object, return the value in the specified column.
    // if given a numeric index, return the value in the specified column.
    Get(row, col)
    {
        if (typeof row == "object")
        {
            return row[this.Idx(col)];
        }
        else
        {
            return this.dataTable[row + 1][this.Idx(col)];
        }
    }

    // if given a row (array) object, return the value in the specified column.
    // if given a numeric index, return the value in the specified column.
    Set(row, col, val)
    {
        if (typeof row == "object")
        {
            row[this.Idx(col)] = val;
        }
        else
        {
            this.dataTable[row + 1][this.Idx(col)] = val;
        }
    }

    RenameColumn(colOld, colNew)
    {
        this.dataTable[0][this.Idx(colOld)] = colNew;

        this.CacheHeaderLocations();
    }

    DeleteColumn(col)
    {
        let idx = this.Idx(col);

        if (idx != -1)
        {
            for (let row of this.dataTable)
            {
                row.splice(idx, 1);
            }
        }

        this.CacheHeaderLocations();
    }

    Extract(headerList)
    {
        const headerRow = this.dataTable[0];
        let idxList = [];

        for (const header of headerList)
        {
            let idx = headerRow.indexOf(header);

            idxList.push(idx);
        }

        // build new data table
        let dataTableNew = [];
        for (const row of this.dataTable)
        {
            let rowNew = [];

            for (const idx of idxList)
            {
                rowNew.push(row[idx]);
            }

            dataTableNew.push(rowNew);
        }

        return dataTableNew;
    }

    DeepCopy()
    {
        return this.Extract(this.dataTable[0]);
    }

    ForEach(fnEachRow)
    {
        for (let i = 1; i < this.dataTable.length; ++i)
        {
            let row = this.dataTable[i];

            fnEachRow(row);
        }
    }

    AppendGeneratedColumns(colHeaderList, fnEachRow, reverseOrder)
    {
        if (reverseOrder == undefined) { reverseOrder = false; }

        this.dataTable[0].push(... colHeaderList);

        if (reverseOrder == false)
        {
            for (let i = 1; i < this.dataTable.length; ++i)
            {
                let row = this.dataTable[i];
    
                row.push(... fnEachRow(row));
            }
        }
        else
        {
            for (let i = this.dataTable.length - 1; i >= 1; --i)
            {
                let row = this.dataTable[i];
    
                row.push(... fnEachRow(row));
            }
        }

        this.CacheHeaderLocations();
    }

    GenerateModifiedColumn(colHeaderList, fnEachRow, reverseOrder)
    {
        if (reverseOrder == undefined) { reverseOrder = false; }
        
        let col = colHeaderList[0];

        if (reverseOrder == false)
        {
            for (let i = 1; i < this.dataTable.length; ++i)
            {
                let row = this.dataTable[i];
    
                let rowNew = fnEachRow(row);
    
                row[this.Idx(col)] = rowNew[0];
            }
        }
        else
        {
            for (let i = this.dataTable.length - 1; i >= 1; --i)
            {
                let row = this.dataTable[i];
    
                let rowNew = fnEachRow(row);
    
                row[this.Idx(col)] = rowNew[0];
            }
        }
    }

    MakeNewDataTable(colHeaderList, fnEachRow)
    {
        let dataTable = [];
        dataTable.push(colHeaderList);

        for (let i = 1; i < this.dataTable.length; ++i)
        {
            dataTable.push(fnEachRow(this.dataTable[i]));
        }

        return dataTable;
    }

    FillUp(col, defaultVal)
    {
        defaultVal = defaultVal | "";

        let idx = this.Idx(col);

        for (let i = this.dataTable.length - 1; i >= 1; --i)
        {
            const row = this.dataTable[i];

            let val = row[idx];

            if (val == null)
            {
                if (i == this.dataTable.length - 1)
                {
                    val = defaultVal;
                }
                else
                {
                    val = this.dataTable[i + 1][idx];
                }

                row[idx] = val;
            }
        }
    }

    FillDown(col, defaultVal, reverseOrder)
    {
        defaultVal = defaultVal | "";

        let idx = this.Idx(col);

        for (let i = 1; i < this.dataTable.length; ++i)
        {
            const row = this.dataTable[i];

            let val = row[idx];

            if (val == null)
            {
                if (i == 1)
                {
                    val = defaultVal;
                }
                else
                {
                    val = this.dataTable[i - 1][idx];
                }

                row[idx] = val;
            }
        }
    }

    MakeSeriesList()
    {
        let seriesList = [];
    
        if (this.dataTable && this.dataTable.length)
        {
            for (let i = 0; i < this.dataTable[0].length; ++i)
            {
                let series = [];
        
                for (let j = 1; j < this.dataTable.length; ++j)
                {
                    series.push(this.dataTable[j][i]);
                }
        
                seriesList.push(series);
            }
        }
    
        return seriesList;
    }

    Reverse()
    {
        // reverse the whole things
        this.dataTable.reverse();

        // swap the header (now at the bottom) to the top
        this.dataTable.unshift(this.dataTable.pop());
    }
}

