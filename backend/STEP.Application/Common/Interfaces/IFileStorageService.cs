using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace STEP.Application.Common.Interfaces
{
    /// <summary>
    /// Abstraction over physical file storage. "Local" today (see Infrastructure's
    /// LocalFileStorageService); swapping to cloud storage later only touches Infrastructure —
    /// CandidateDocument.StorageProvider already records which implementation wrote a given file.
    /// </summary>
    public interface IFileStorageService
    {
        /// <summary>Saves the stream under the given relative folder and returns the stored relative path.</summary>
        Task<string> SaveAsync(string relativeFolder, string fileName, Stream content, CancellationToken cancellationToken = default);

        /// <summary>Reads back a file previously saved at the relative path returned by SaveAsync.</summary>
        Task<byte[]> ReadAsync(string relativePath, CancellationToken cancellationToken = default);

        string ProviderName { get; }
    }
}
