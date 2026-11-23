// 1. PENGECEKAN LOGIN
const sessionRole = sessionStorage.getItem('role');
const sessionUsername = sessionStorage.getItem('username');

if (!sessionRole) {
    window.location.href = 'login.html';
}

document.getElementById('namaUser').textContent = sessionUsername;

if (sessionRole === 'karyawan') {
    document.getElementById('panelForm').style.display = 'none';
    document.getElementById('btnCetak').style.display = 'none';
    document.querySelector('.container').style.gridTemplateColumns = '1fr';
}

// 2. FUNGSI LOGOUT
function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// 3. LOGIKA CRUD
const apiUrl = 'api/api_barang.php';

async function muatData() {
    try {
        const response = await fetch(apiUrl);
        const dataTas = await response.json();
        const tbody = document.getElementById('tabelBody');
        tbody.innerHTML = '';

        dataTas.forEach(tas => {
            const btnHapus = sessionRole === 'admin'
                ? `<button class="btn-delete" onclick="hapusTas(${tas.id})">Hapus</button>`
                : '';

            const merkAman = String(tas.merk).replace(/'/g, "\\'");
            const tipeAman = String(tas.tipe).replace(/'/g, "\\'");

            const row = `<tr>
                <td>${tas.id}</td>
                <td>${tas.merk}</td>
                <td>${tas.tipe}</td>
                <td>Rp ${Number(tas.harga).toLocaleString('id-ID')}</td>
                <td>${tas.stok}</td>
                <td class="aksi-kolom">
                    <button class="btn-edit" onclick="siapkanEdit(${tas.id}, '${merkAman}', '${tipeAman}', ${tas.harga}, ${tas.stok})">Edit</button>
                    ${btnHapus}
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Gagal mengambil data:', error);
    }
}

function siapkanEdit(id, merk, tipe, harga, stok) {
    document.getElementById('panelForm').style.display = 'block';

    if (sessionRole === 'karyawan') {
        document.querySelector('.container').style.gridTemplateColumns = '340px 1fr';
    }

    document.getElementById('tasId').value = id;
    document.getElementById('merk').value = merk;
    document.getElementById('tipe').value = tipe;
    document.getElementById('harga').value = harga;
    document.getElementById('stok').value = stok;
    document.querySelector('#formTas button[type="submit"]').textContent = 'Update Data';
}

document.getElementById('formTas').addEventListener('submit', async function (e) {
    e.preventDefault();
    const id = document.getElementById('tasId').value;
    const dataTas = {
        merk: document.getElementById('merk').value,
        tipe: document.getElementById('tipe').value,
        harga: parseFloat(document.getElementById('harga').value),
        stok: parseInt(document.getElementById('stok').value)
    };

    try {
        if (id) {
            await fetch(`${apiUrl}?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Username': sessionUsername
                },
                body: JSON.stringify(dataTas)
            });
        } else {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Username': sessionUsername
                },
                body: JSON.stringify(dataTas)
            });
        }

        this.reset();
        document.getElementById('tasId').value = '';
        document.querySelector('#formTas button[type="submit"]').textContent = 'Simpan Data';

        if (sessionRole === 'karyawan') {
            document.getElementById('panelForm').style.display = 'none';
            document.querySelector('.container').style.gridTemplateColumns = '1fr';
        }

        muatData();
        if (sessionRole === 'admin') muatLog();
    } catch (error) {
        console.error('Gagal memproses data:', error);
    }
});

async function hapusTas(id) {
    if (confirm('Yakin ingin menghapus tas ini?')) {
        try {
            await fetch(`${apiUrl}?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'X-Username': sessionUsername
                }
            });
            muatData();
            if (sessionRole === 'admin') muatLog();
        } catch (error) {
            console.error('Gagal menghapus data:', error);
        }
    }
}

muatData();

// 4. FITUR PENCARIAN (LIVE SEARCH)
document.getElementById('inputPencarian').addEventListener('keyup', function () {
    let keyword = this.value.toLowerCase();
    let barisTabel = document.querySelectorAll('#tabelBody tr');

    barisTabel.forEach(baris => {
        let merk = baris.cells[1].textContent.toLowerCase();
        let tipe = baris.cells[2].textContent.toLowerCase();

        if (merk.includes(keyword) || tipe.includes(keyword)) {
            baris.style.display = '';
        } else {
            baris.style.display = 'none';
        }
    });
});

// 5. FUNGSI CETAK DENGAN TANGGAL OTOMATIS
function cetakLaporan() {
    const sekarang = new Date();
    const opsiWaktu = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const stringWaktu = sekarang.toLocaleDateString('id-ID', opsiWaktu);

    document.getElementById('waktuCetak').textContent = "Dicetak pada: " + stringWaktu;
    window.print();
}

// 6. FITUR RIWAYAT (LOG)
async function muatLog() {
    try {
        const response = await fetch('api/api_logs.php');
        const dataLog = await response.json();
        const tbodyLog = document.getElementById('tabelLog');
        tbodyLog.innerHTML = '';

        dataLog.forEach(log => {
            const waktu = new Date(log.waktu).toLocaleString('id-ID');
            const row = `<tr>
                <td>${waktu}</td>
                <td><b>${log.username.toUpperCase()}</b></td>
                <td style="text-align: left;">${log.aksi}</td>
            </tr>`;
            tbodyLog.innerHTML += row;
        });
    } catch (error) {
        console.error('Gagal mengambil data log:', error);
    }
}

if (sessionRole === 'admin') {
    document.getElementById('panelLog').style.display = 'block';
    muatLog();
}